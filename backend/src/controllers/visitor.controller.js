import supabase from '../config/supabase.js';
import geoip from 'geoip-lite';
import { UAParser } from 'ua-parser-js';
import { uuid, isUuid, shortToken } from '../utils/uuid.js';
import usageService from '../services/usage.service.js';
import { getClientIp } from '../utils/ip.js';
import crypto from 'crypto';
import NotificationService from '../services/notification.service.js';
import ActivityLogService from '../services/activity.service.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../errors/AppError.js';

/**
 * Fallback coordinates for local testing (localhost / 127.0.0.1)
 * This ensures markers appear on the map during development.
 */
/**
 * Enhanced High Accuracy Geo Lookup with timeout and fallback.
 */
const getHighAccuracyGeo = async (ip) => {
    let targetIp = ip;
    try {
        // 1. Resolve Localhost (Development environment helper)
        if (ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1') {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000);
            const ipifyResponse = await fetch('https://api.ipify.org?format=json', { signal: controller.signal });
            clearTimeout(timeoutId);
            const ipifyData = await ipifyResponse.json();
            targetIp = ipifyData.ip;
        }

        // 2. High Accuracy Lookup (ip-api.com) with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        const response = await fetch(`http://ip-api.com/json/${targetIp}?fields=status,message,country,countryCode,region,regionName,city,lat,lon`, { 
            signal: controller.signal 
        });
        clearTimeout(timeoutId);
        const data = await response.json();

        if (data.status === 'success') {
            return {
                country: data.country,
                countryCode: data.countryCode || (data.country && data.country.length === 2 ? data.country : 'XX'),
                region: data.regionName || data.region || null,
                city: data.city || 'Unknown',
                lat: data.lat,
                lng: data.lon
            };
        }
    } catch (err) {
        // Silent fail, falls through to local lookup
        if (err.name === 'AbortError') {
            console.warn(`[GeoIP] Timeout for IP: ${targetIp}`);
        } else {
            console.error('[GeoIP] Lookup failed:', err.message);
        }
    }

    // 3. Fallback (geoip-lite - offline local DB)
    try {
        const geo = geoip.lookup(targetIp);
        if (geo) {
            return {
                country: geo.country || 'Unknown',
                countryCode: geo.country || 'XX',
                region: geo.region || null,
                city: geo.city || 'Unknown',
                lat: geo.ll ? geo.ll[0] : null,
                lng: geo.ll ? geo.ll[1] : null
            };
        }
    } catch (fallbackErr) {
        console.error('[GeoIP] Fallback failed:', fallbackErr.message);
    }

    return { country: 'Unknown', countryCode: 'XX', region: null, city: 'Unknown', lat: null, lng: null };
};

// Simple in-memory cache for deduplication (rolling TTL)
const requestCache = new Map();

/**
 * Generates a unique hash for a visitor hit to prevent inflation.
 * Hash = SHA256(IP + UserAgent + ProjectId)
 */
const generateHitHash = (ip, ua, projectId) => {
    return crypto.createHash('sha256')
        .update(`${ip}-${ua}-${projectId}`)
        .digest('hex');
};

/**
 * Basic bot heuristics based on User-Agent and patterns.
 */
const isBot = (ua, req) => {
    if (!ua) return true;
    const botPatterns = [
        'bot', 'crawler', 'spider', 'crawling', 'slurp', 'googlebot',
        'bingbot', 'yandexbot', 'baiduspider', 'facebookexternalhit',
        'twitterbot', 'rogerbot', 'linkedinbot', 'embedly', 'quora link preview',
        'showyoubot', 'outbrain', 'pinterest/0.', 'developers.google.com/+/web/snippet',
        'slackbot', 'vkShare', 'W3C_Validator', 'redditbot', 'Applebot',
        'WhatsApp', 'flipboard', 'tumblr', 'bitlybot', 'SkypeShell',
        'Digg', 'bufferbot', 'quora', 'monit', 'Nagios', 'HubSpot',
        'Pingdom', 'Screaming Frog', 'uptimerobot'
    ];

    const uaLower = ua.toLowerCase();
    if (botPatterns.some(pattern => uaLower.includes(pattern.toLowerCase()))) {
        return true;
    }

    // Check for headless browsers or missing common headers
    if (uaLower.includes('headless') || !req.headers['accept-language']) {
        return true;
    }

    return false;
};

/**
 * Unified Analytics Ingestion Engine
 * Concurrently updates visitors, sessions, page_views, events, analytics_daily, and counters.
 */
const recordAnalyticsHit = async ({
    project,
    ip,
    userAgent,
    type = 'pageview',
    pageUrl = '/',
    title = '',
    referrer = '',
    eventName = null,
    eventCategory = null,
    properties = {},
    customSessionId = null,
    req
}) => {
    // 1. Sanitize & bounded input
    const cleanUrl = String(pageUrl || '/').slice(0, 2048);
    const cleanTitle = String(title || (eventName ? `Event: ${eventName}` : 'Page View')).slice(0, 500);
    const cleanReferrer = referrer ? String(referrer).slice(0, 2048) : null;
    const cleanEventName = eventName ? String(eventName).slice(0, 100) : null;

    let path = cleanUrl;
    let utmSource = null, utmMedium = null, utmCampaign = null;
    try {
        const parsed = new URL(cleanUrl, 'http://localhost');
        path = (parsed.pathname || '/') + (parsed.search || '');
        utmSource = parsed.searchParams.get('utm_source');
        utmMedium = parsed.searchParams.get('utm_medium');
        utmCampaign = parsed.searchParams.get('utm_campaign');
    } catch {
        path = cleanUrl.slice(0, 500);
    }

    // 2. High-accuracy Geo & Device detection
    const geo = await getHighAccuracyGeo(ip);
    const parser = new UAParser(userAgent);
    const uaResult = parser.getResult();

    const countryName = geo.country || 'Unknown';
    const countryCode = geo.countryCode || (geo.country && geo.country.length === 2 ? geo.country : 'XX');
    const region = geo.region || null;
    const city = geo.city || 'Unknown';
    const lat = geo.lat;
    const lng = geo.lng;

    const deviceType = uaResult.device.type || 'desktop';
    const browserName = uaResult.browser.name || 'Unknown';
    const browserVersion = uaResult.browser.version || null;
    const osName = uaResult.os.name || 'Unknown';
    const osVersion = uaResult.os.version || null;
    const language = req.headers?.['accept-language'] ? req.headers['accept-language'].split(',')[0].trim().slice(0, 10) : null;

    // 3. Visitor identity & deduplication (no raw IP stored in visitor_hash)
    const visitorHash = crypto.createHash('sha256')
        .update(`${ip}-${userAgent}-${project.id}`)
        .digest('hex');
    const sessionId = customSessionId || visitorHash.substring(0, 20);

    // 4. Upsert Visitor
    const visitorPayload = {
        user_id: project.user_id,
        project_id: project.id,
        session_id: sessionId,
        visitor_hash: visitorHash,
        ip_address: ip,
        user_agent: userAgent,
        country: countryName,
        country_name: countryName,
        country_code: countryCode,
        region: region,
        city: city,
        device_type: deviceType,
        browser: browserName,
        browser_version: browserVersion,
        os: osName,
        operating_system: osName,
        operating_system_version: osVersion,
        language: language,
        page_url: cleanUrl,
        referrer: cleanReferrer,
        is_active: true,
        last_seen: new Date(),
        last_seen_at: new Date()
    };

    const { data: visitor, error: vErr } = await supabase
        .from('visitors')
        .upsert(visitorPayload, { onConflict: 'session_id' })
        .select()
        .single();

    if (vErr || !visitor) {
        console.error('[Analytics] Visitor upsert error:', vErr);
        return { visitor: null, session: null };
    }

    // 5. Upsert Session
    let sessionRecord = null;
    let isNewSession = false;
    try {
        const { data: existingSession } = await supabase
            .from('sessions')
            .select('id, page_views, event_count, started_at')
            .eq('project_id', project.id)
            .eq('session_id', sessionId)
            .maybeSingle();

        const now = new Date();
        if (existingSession) {
            const durationSec = existingSession.started_at
                ? Math.max(0, Math.floor((now.getTime() - new Date(existingSession.started_at).getTime()) / 1000))
                : 0;

            const { data: updSession } = await supabase
                .from('sessions')
                .update({
                    last_activity_at: now,
                    ended_at: now,
                    duration_seconds: durationSec,
                    exit_page: path,
                    page_views: type === 'pageview' ? (existingSession.page_views || 0) + 1 : (existingSession.page_views || 0),
                    event_count: type === 'event' ? (existingSession.event_count || 0) + 1 : (existingSession.event_count || 0)
                })
                .eq('id', existingSession.id)
                .select()
                .single();
            sessionRecord = updSession;
        } else {
            isNewSession = true;
            const { data: newSession } = await supabase
                .from('sessions')
                .insert({
                    project_id: project.id,
                    visitor_id: visitor.id,
                    session_id: sessionId,
                    started_at: now,
                    last_activity_at: now,
                    ended_at: now,
                    duration_seconds: 0,
                    page_views: type === 'pageview' ? 1 : 0,
                    event_count: type === 'event' ? 1 : 0,
                    entry_page: path,
                    exit_page: path,
                    referrer: cleanReferrer,
                    utm_source: utmSource,
                    utm_medium: utmMedium,
                    utm_campaign: utmCampaign,
                    device_type: deviceType,
                    browser: browserName,
                    operating_system: osName,
                    country_code: countryCode
                })
                .select()
                .single();
            sessionRecord = newSession;
        }
    } catch (sErr) {
        console.error('[Analytics] Session upsert error:', sErr);
    }

    // 6. Record Page View or Custom Event
    if (type === 'pageview' || !cleanEventName) {
        await supabase.from('page_views').insert({
            visitor_id: visitor.id,
            user_id: project.user_id,
            project_id: project.id,
            session_id: sessionRecord?.id || null,
            path: path,
            url: cleanUrl,
            page_url: cleanUrl,
            title: cleanTitle,
            referrer: cleanReferrer,
            viewed_at: new Date()
        });
    }

    if (type === 'event' || cleanEventName) {
        await supabase.from('events').insert({
            project_id: project.id,
            visitor_id: visitor.id,
            session_id: sessionRecord?.id || null,
            event_name: cleanEventName || 'custom_event',
            event_category: eventCategory || 'general',
            page_path: path,
            properties: typeof properties === 'object' && properties !== null ? properties : {},
            occurred_at: new Date()
        });
    }

    // 7. Update Daily Aggregation Rollup
    try {
        const today = new Date().toISOString().slice(0, 10);
        const { data: dailyRow } = await supabase
            .from('analytics_daily')
            .select('id, page_views, events')
            .eq('project_id', project.id)
            .eq('date', today)
            .maybeSingle();

        if (dailyRow) {
            await supabase.from('analytics_daily').update({
                page_views: type === 'pageview' ? (dailyRow.page_views || 0) + 1 : dailyRow.page_views,
                events: type === 'event' ? (dailyRow.events || 0) + 1 : (dailyRow.events || 0) + 1
            }).eq('id', dailyRow.id);
        } else {
            await supabase.from('analytics_daily').insert({
                project_id: project.id,
                date: today,
                visitors: 1,
                sessions: 1,
                page_views: type === 'pageview' ? 1 : 0,
                events: type === 'event' ? 1 : 0
            });
        }
    } catch {
        // Daily rollup update non-blocking
    }

    // 8. Update Project Counters & Monthly Usages
    try {
        const { error: counterError } = await supabase.rpc('increment_project_counter', {
            p_id: project.id
        });

        if (counterError) {
            const { data: counter } = await supabase
                .from('counters')
                .select('count')
                .eq('project_id', project.id)
                .single();

            if (counter) {
                await supabase
                    .from('counters')
                    .update({ count: (counter.count || 0) + 1, updated_at: new Date() })
                    .eq('project_id', project.id);
            } else {
                await supabase
                    .from('counters')
                    .insert({ project_id: project.id, count: 1 });
            }
        }

        const currentMonth = new Date().toISOString().slice(0, 7);
        const { data: usage } = await supabase
            .from('usages')
            .select('views')
            .eq('project_id', project.id)
            .eq('month', currentMonth)
            .single();

        if (usage) {
            await supabase
                .from('usages')
                .update({ views: usage.views + 1, updated_at: new Date() })
                .eq('project_id', project.id)
                .eq('month', currentMonth);
        } else {
            await supabase
                .from('usages')
                .insert({ project_id: project.id, month: currentMonth, views: 1 });
        }
    } catch (cErr) {
        console.error('[Analytics] Counter/Usage error:', cErr);
    }

    // 9. Realtime WebSocket Broadcast
    if (global.io && project.user_id) {
        global.io.to(`user_${project.user_id}`).emit('visitor_update', { 
            ...visitor, 
            lat,
            lng,
            project_id: project.id,
            title: cleanTitle,
            type
        });
        const updatedUsage = await usageService.calculateUsage(project.user_id);
        global.io.to(`user_${project.user_id}`).emit('usage_update', updatedUsage);
    }

    // 10. Activity Log
    if (project.user_id && isNewSession) {
        await ActivityLogService.log(
            project.id,
            project.user_id,
            type === 'event' ? 'event.tracked' : 'visitor.new',
            `Page: ${cleanTitle}, Country: ${countryName}`,
            'success',
            ip,
            {
                session_id: sessionId,
                resource: path,
                http_method: req.method,
                http_status: 200,
                country: countryName,
                country_code: countryCode,
                city,
                user_agent: userAgent,
                event_type: type === 'event' ? 'event.tracked' : 'visitor.new',
                event_name: cleanEventName || null
            }
        );
    }

    return { visitor, session: sessionRecord, lat, lng, country: countryName, city };
};

export const trackVisitor = asyncHandler(async (req, res) => {
    const { trackingCode, sessionId, pageUrl, referrer, title } = req.body;
    const userAgent = req.headers['user-agent'] || '';

    // 1. IP Trust Chain
    const ip = getClientIp(req);

    // 2. Bot Filtering
    if (isBot(userAgent, req)) {
        return res.json({ success: true, bot: true });
    }

    // 3. Tracking Abuse Prevention (Hashing + Rolling TTL)
    const hitHash = generateHitHash(ip, userAgent, trackingCode);
    const now = Date.now();

    if (requestCache.has(hitHash)) {
        const lastHit = requestCache.get(hitHash);
        if (now - lastHit < 2000) {
            return res.json({ success: true, ignored: 'DUPLICATE_HIT' });
        }
    }
    requestCache.set(hitHash, now);

    // Cleanup cache periodically
    if (requestCache.size > 10000) {
        for (const [key, timestamp] of requestCache.entries()) {
            if (now - timestamp > 60000) requestCache.delete(key);
        }
    }

    const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('id, user_id, plan, is_active')
        .eq('tracking_id', trackingCode)
        .maybeSingle();

    if (projectError || !project) {
        throw AppError.notFound('Project not found', 'INVALID_TRACKING_ID');
    }

    if (project.is_active === false) {
        throw AppError.forbidden('Project is disabled');
    }

    // Check limits before proceeding
    const limitCheck = await usageService.checkLimit(project.user_id);
    if (!limitCheck.canTrack) {
        throw AppError.limitExceeded(limitCheck.reason, limitCheck.usage);
    }

    await recordAnalyticsHit({
        project,
        ip,
        userAgent,
        type: 'pageview',
        pageUrl,
        title,
        referrer,
        customSessionId: sessionId || hitHash.substring(0, 20),
        req
    });

    res.json({ success: true });
});

export const getLiveVisitors = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

    const { data: visitors, error } = await supabase
        .from('visitors')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .gte('last_seen', fiveMinutesAgo);

    if (error) throw error;

    res.json(visitors);
});

export const getDashboardStats = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { range, projectId } = req.query;

    const scope = (table, select, opts = {}) => {
        let q = supabase.from(table).select(select, opts);
        q = q.eq('user_id', userId);
        if (projectId) q = q.eq('project_id', projectId);
        return q;
    };

    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const { count: realTimeVisitors } = await scope('visitors', '*', { count: 'exact', head: true })
        .eq('is_active', true)
        .gte('last_seen', fiveMinutesAgo);

    const days = range === '24h' ? 1 : range === '7d' ? 7 : range === '90d' ? 90 : 30;
    const startDate = new Date();
    if (range === '24h') {
        startDate.setHours(startDate.getHours() - 24);
    } else {
        startDate.setDate(startDate.getDate() - (days - 1));
    }
    const startDateStr = startDate.toISOString();
    const spanMs = days * 24 * 60 * 60 * 1000;
    const prevStartStr = new Date(startDate.getTime() - spanMs).toISOString();

    const computeSessionTotals = (rows) => {
        const byVisitor = new Map();
        rows.forEach(r => {
            const t = new Date(r.created_at).getTime();
            const cur = byVisitor.get(r.visitor_id);
            if (cur) {
                if (t < cur.first) cur.first = t;
                if (t > cur.last) cur.last = t;
                cur.count += 1;
            } else {
                byVisitor.set(r.visitor_id, { first: t, last: t, count: 1 });
            }
        });
        const sessionCount = byVisitor.size;
        let bounces = 0;
        let totalDurationSec = 0;
        byVisitor.forEach(e => {
            if (e.count === 1) bounces += 1;
            else totalDurationSec += (e.last - e.first) / 1000;
        });
        return {
            sessions: sessionCount,
            bounceRate: sessionCount === 0 ? null : Math.round((bounces / sessionCount) * 1000) / 10,
            avgSessionDuration: sessionCount === 0 ? null : Math.round(totalDurationSec / sessionCount)
        };
    };

    const [curSessRes, prevSessRes] = await Promise.all([
        scope('page_views', 'visitor_id, created_at').gte('created_at', startDateStr).limit(50000),
        scope('page_views', 'visitor_id, created_at').gte('created_at', prevStartStr).lt('created_at', startDateStr).limit(50000)
    ]);
    const curSessRows = curSessRes.data || [];
    const prevRows = prevSessRes.data || [];

    const { sessions, bounceRate, avgSessionDuration } = computeSessionTotals(curSessRows || []);
    const prevTotals = computeSessionTotals(prevRows || []);

    const { count: prevViews } = await scope('page_views', '*', { count: 'exact', head: true })
        .gte('created_at', prevStartStr)
        .lt('created_at', startDateStr);

    const { data: dailyViews } = await scope('page_views', 'created_at, visitor_id, session_id')
        .gte('created_at', startDateStr)
        .limit(50000);

    const { data: prevDailyViews } = await scope('page_views', 'created_at')
        .gte('created_at', prevStartStr)
        .lt('created_at', startDateStr)
        .limit(50000);

    const bucketKey = (iso) => (range === '24h' ? iso.slice(0, 13) + ':00:00.000Z' : iso.split('T')[0]);
    const bucketLabel = (iso) => (range === '24h'
        ? new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));

    const trafficKeys = [];
    if (range === '24h') {
        for (let i = 23; i >= 0; i--) {
            const d = new Date();
            d.setHours(d.getHours() - i);
            trafficKeys.push(d.toISOString().slice(0, 13) + ':00:00.000Z');
        }
    } else {
        for (let i = days - 1; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            trafficKeys.push(d.toISOString().split('T')[0]);
        }
    }

    const trafficBuckets = trafficKeys.map(key => ({
        key,
        name: bucketLabel(key),
        views: 0,
        visitors: new Set(),
        sessions: new Set(),
        compare: 0
    }));
    const bucketIndex = new Map(trafficKeys.map((k, i) => [k, i]));

    (dailyViews || []).forEach(v => {
        const idx = bucketIndex.get(bucketKey(v.created_at));
        if (idx === undefined) return;
        const b = trafficBuckets[idx];
        b.views++;
        if (v.visitor_id) b.visitors.add(v.visitor_id);
        if (v.session_id) b.sessions.add(v.session_id);
    });

    // Previous-period counts aligned to the same bucket index for the compare series
    const prevBucketIndex = new Map();
    trafficKeys.forEach((k, i) => {
        const d = new Date(k);
        d.setTime(d.getTime() - spanMs);
        prevBucketIndex.set(bucketKey(d.toISOString()), i);
    });
    (prevDailyViews || []).forEach(v => {
        const idx = prevBucketIndex.get(bucketKey(v.created_at));
        if (idx !== undefined) trafficBuckets[idx].compare++;
    });

    const trafficData = trafficBuckets.map(b => ({
        name: b.name,
        views: b.views,
        visitors: b.visitors.size,
        sessions: b.sessions.size,
        fullDate: b.key,
        compare: b.compare
    }));

    const { data: sources } = await scope('visitors', 'referrer')
        .gte('last_seen', startDateStr)
        .limit(50000);

    const sourceMap = {};
    sources?.forEach(s => {
        const ref = s.referrer ? new URL(s.referrer).hostname : 'Direct';
        sourceMap[ref] = (sourceMap[ref] || 0) + 1;
    });

    const sourceData = Object.entries(sourceMap)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5)
        .map((s, i) => ({ ...s, color: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'][i] || '#CBD5E1' }));

    const activityLimit = Math.min(parseInt(req.query.limit) || 20, 100);
    const { data: recentActivity } = await scope('page_views', '*, visitors(ip_address, device_type, browser, os, city, country)')
        .gte('created_at', startDateStr)
        .order('created_at', { ascending: false })
        .limit(activityLimit);

    const liveActivity = await Promise.all((recentActivity || []).map(async v => {
        const visitor = v.visitors || {};
        const city = visitor.city === 'Unknown' ? '' : visitor.city;
        const country = visitor.country === 'Unknown' ? '' : visitor.country;
        const location = [city, country].filter(Boolean).join(', ') || 'Unknown Location';

        let site = 'Unknown Site';
        let path = '/';
        try {
            const url = new URL(v.page_url);
            site = url.hostname;
            path = url.pathname;
        } catch (e) {
            site = v.page_url || 'Unknown';
        }

        let lat = null;
        let lng = null;
        if (visitor.ip_address) {
            const geo = await getHighAccuracyGeo(visitor.ip_address);
            lat = geo.lat;
            lng = geo.lng;
        }

        const deviceLabel =
            visitor.device_type === 'mobile' ? 'Mobile' :
            visitor.device_type === 'tablet' ? 'Tablet' :
            visitor.device_type === 'desktop' ? 'Desktop' :
            (visitor.device_type || 'Desktop');

        return {
            id: v.id,
            type: 'view',
            location,
            ip: visitor.ip_address,
            lat,
            lng,
            site,
            path,
            title: v.title,
            device: deviceLabel,
            browser: visitor.browser || 'Unknown',
            os: visitor.os || 'Unknown',
            timestamp: v.created_at
        };
    }));

    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
    const { data: recentViews } = await scope('page_views', 'created_at')
        .gte('created_at', thirtyMinutesAgo)
        .limit(50000);

    const sparklineMap = {};
    for (let i = 29; i >= 0; i--) {
        const d = new Date();
        d.setMinutes(d.getMinutes() - i);
        const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        sparklineMap[timeStr] = 0;
    }

    recentViews?.forEach(v => {
        const timeStr = new Date(v.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        if (sparklineMap[timeStr] !== undefined) {
            sparklineMap[timeStr]++;
        }
    });

    const sparkline = Object.keys(sparklineMap).map(key => ({ name: key, value: sparklineMap[key] }));

    const { data: devices } = await scope('visitors', 'device_type, browser, os, country')
        .gte('last_seen', startDateStr)
        .limit(50000);

    const deviceMap = {};
    const browserMap = {};
    const osMap = {};
    const countryMap = {};

    devices?.forEach(d => {
        const type = d.device_type || 'desktop';
        deviceMap[type] = (deviceMap[type] || 0) + 1;
        if (d.browser) browserMap[d.browser] = (browserMap[d.browser] || 0) + 1;
        if (d.os) osMap[d.os] = (osMap[d.os] || 0) + 1;
        if (d.country && d.country !== 'Unknown') countryMap[d.country] = (countryMap[d.country] || 0) + 1;
    });

    const deviceStats = Object.keys(deviceMap).map(key => ({
        name: key.charAt(0).toUpperCase() + key.slice(1),
        value: deviceMap[key],
        color: key === 'desktop' ? '#3B82F6' : key === 'mobile' ? '#10B981' : '#F59E0B'
    }));

    const browserStats = Object.entries(browserMap)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);

    const osStats = Object.entries(osMap)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);

    const countryStats = Object.entries(countryMap)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 10);

    const { data: pages } = await scope('page_views', 'page_url, title, visitor_id, session_id')
        .gte('created_at', startDateStr)
        .limit(50000);

    const pageMap = {};
    const uniqueVisitorIds = new Set();
    pages?.forEach(p => {
        if (p.visitor_id) uniqueVisitorIds.add(p.visitor_id);
        let path = '/';
        try {
            const url = new URL(p.page_url);
            path = url.pathname;
        } catch (e) {
            path = p.page_url || '/';
        }
        if (!pageMap[path]) {
            pageMap[path] = { views: 0, title: p.title || path, visitors: new Set(), sessions: new Set() };
        }
        pageMap[path].views++;
        if (p.visitor_id) pageMap[path].visitors.add(p.visitor_id);
        if (p.session_id) pageMap[path].sessions.add(p.session_id);
        if (p.title && p.title !== 'Unknown Page' && p.title !== path) {
            pageMap[path].title = p.title;
        }
    });

    const topPages = Object.entries(pageMap)
        .map(([url, data]) => ({
            url,
            views: data.views,
            title: data.title,
            unique_visitors: data.visitors.size,
            sessions: data.sessions.size
        }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 10);

    const uniqueVisitors = uniqueVisitorIds.size;
    const viewsTotal = trafficData.reduce((acc, d) => acc + d.views, 0);

    const { data: userProjects } = await supabase
        .from('projects')
        .select('id')
        .eq('user_id', userId);
    const projectIds = projectId ? [projectId] : (userProjects || []).map(p => p.id);

    let eventsSummary = [];
    let sessionsList = [];
    if (projectIds.length) {
        const [eventsRes, sessionsRes] = await Promise.all([
            supabase
                .from('events')
                .select('event_name, visitor_id, occurred_at')
                .in('project_id', projectIds)
                .gte('occurred_at', startDateStr)
                .limit(50000),
            supabase
                .from('sessions')
                .select('*')
                .in('project_id', projectIds)
                .gte('last_activity_at', startDateStr)
                .order('last_activity_at', { ascending: false })
                .limit(50)
        ]);

        const eventMap = new Map();
        (eventsRes.data || []).forEach(e => {
            const name = e.event_name || 'custom_event';
            if (!eventMap.has(name)) eventMap.set(name, { occurrences: 0, visitors: new Set(), last: null });
            const entry = eventMap.get(name);
            entry.occurrences += 1;
            if (e.visitor_id) entry.visitors.add(e.visitor_id);
            if (e.occurred_at && (!entry.last || e.occurred_at > entry.last)) entry.last = e.occurred_at;
        });
        eventsSummary = Array.from(eventMap.entries())
            .map(([name, v]) => ({ name, occurrences: v.occurrences, visitors: v.visitors.size, last: v.last }))
            .sort((a, b) => b.occurrences - a.occurrences);

        sessionsList = sessionsRes.data || [];
    }

    const { data: visitorsList } = await scope('visitors', '*')
        .gte('last_seen', startDateStr)
        .order('last_seen', { ascending: false })
        .limit(50);

    res.json({
        realTimeVisitors: realTimeVisitors || 0,
        viewsTotal,
        uniqueVisitors,
        prevViews: prevViews || 0,
        sessions,
        prevSessions: prevTotals.sessions,
        bounceRate,
        avgSessionDuration,
        prevBounceRate: prevTotals.bounceRate,
        prevAvgSessionDuration: prevTotals.avgSessionDuration,
        trafficData,
        sourceData,
        liveActivity,
        sparkline,
        deviceStats,
        browserStats,
        osStats,
        countryStats,
        topPages,
        eventsSummary,
        sessionsList,
        visitorsList: visitorsList || [],
        range
    });
});

export const trackVisitorPublic = asyncHandler(async (req, res) => {
    const { trackingId } = req.params;
    const { pageUrl, referrer, title } = req.body;
    const userAgent = req.headers['user-agent'] || '';

    // 1. IP Trust Chain
    const ip = getClientIp(req);

    // 2. Bot Filtering
    if (isBot(userAgent, req)) {
        return res.json({ success: true, bot: true });
    }

    // Fetch Project
    const { data: project } = await supabase
        .from('projects')
        .select('id, user_id, allowed_origins, is_active')
        .eq('tracking_id', trackingId)
        .single();

    if (!project) {
        throw AppError.notFound('Invalid tracking code', 'INVALID_TRACKING_ID');
    }

    if (project.is_active === false) {
        if (project.user_id) {
            await ActivityLogService.log(
                project.id,
                project.user_id,
                'visitor.blocked',
                `Tracking attempt blocked: Project is disabled`,
                'failure',
                ip,
                {
                    resource: pageUrl,
                    http_method: req.method,
                    http_status: 403,
                    user_agent: userAgent,
                    event_type: 'visitor.blocked'
                }
            );
        }
        throw AppError.forbidden('Project is disabled');
    }

    // Check Allowed Origins
    const origin = req.headers['origin'] || req.headers['referer'];
    if (project.allowed_origins && project.allowed_origins.length > 0 && origin) {
        try {
            let originHostname;
            if (origin === 'null') {
                originHostname = 'null';
            } else {
                originHostname = new URL(origin).hostname;
            }
            const allowedOriginsArray = project.allowed_origins.split(',').map(o => {
                try {
                    // If it's a full URL, extract the hostname
                    if (o.trim().startsWith('http')) {
                        return new URL(o.trim()).hostname;
                    }
                    return o.trim();
                } catch (e) {
                    return o.trim();
                }
            });
            const isAllowed = allowedOriginsArray.some(allowed =>
                originHostname === allowed || originHostname.endsWith('.' + allowed)
            );

            if (!isAllowed) {
                // Notify user about blocked origin
                await NotificationService.create(
                    project.user_id,
                    'Security Alert: Origin Blocked',
                    `Blocked request from unauthorized origin: ${originHostname} for project "${project.name || 'Unknown'}"`,
                    'security'
                );

                // Log security alert as failure
                if (project.user_id) {
                    await ActivityLogService.log(
                        project.id,
                        project.user_id,
                        'security.alert',
                        `Blocked request from unauthorized origin: ${originHostname}`,
                        'failure',
                        ip,
                        {
                            resource: pageUrl,
                            http_method: req.method,
                            http_status: 403,
                            user_agent: userAgent,
                            event_type: 'security.alert'
                        }
                    );
                }

                throw AppError.forbidden('ORIGIN_NOT_ALLOWED', 'ORIGIN_NOT_ALLOWED');
            }
        } catch (urlError) {
            console.error('Origin validation error:', urlError);
            throw AppError.forbidden('INVALID_ORIGIN', 'INVALID_ORIGIN');
        }
    }

    // Check Limits
    const limitCheck = await usageService.checkLimit(project.user_id);
    if (!limitCheck.canTrack) {
        throw AppError.limitExceeded(limitCheck.reason);
    }

    // 3. Tracking Abuse Prevention (Hashing + Rolling TTL)
    const hitHash = generateHitHash(ip, userAgent, trackingId);
    const now = Date.now();

    if (requestCache.has(hitHash)) {
        const lastHit = requestCache.get(hitHash);
        if (now - lastHit < 5000) { // 5 seconds TTL
            return res.json({ success: true, ignored: 'DUPLICATE_HIT' });
        }
    }
    requestCache.set(hitHash, now);

    await recordAnalyticsHit({
        project,
        ip,
        userAgent,
        type: 'pageview',
        pageUrl,
        title,
        referrer,
        customSessionId: req.body?.sessionId || hitHash.substring(0, 20),
        req
    });

    // Fetch the updated count to return to the frontend
    const { data: counter } = await supabase
        .from('counters')
        .select('count')
        .eq('project_id', project.id)
        .single();

    res.json({
        success: true,
        count: counter?.count || 0
    });
});

export const getVisitorCountPublic = asyncHandler(async (req, res) => {
    const { trackingId } = req.params;
    const { data: project, error } = await supabase
        .from('projects')
        .select('counters(count)')
        .eq('tracking_id', trackingId)
        .single();

    if (error || !project) {
        throw AppError.notFound('Project not found');
    }

    // Supabase returns joined tables as arrays by default
    const count = Array.isArray(project.counters)
        ? project.counters[0]?.count
        : project.counters?.count;

    res.json({ count: count || 0 });
});

export const getProjectDetailedStats = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    let query = supabase
        .from('projects')
        .select('id, tracking_id')
        .eq('user_id', userId);

    if (isUuid(id)) {
        query = query.eq('id', id);
    } else {
        query = query.eq('name', id);
    }

    const { data: project } = await query.single();

    if (!project) {
        throw AppError.notFound('Project not found');
    }

    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const { count: realTimeVisitors } = await supabase
        .from('visitors')
        .select('*', { count: 'exact', head: true })
        .eq('project_id', project.id)
        .eq('is_active', true)
        .gte('last_seen', fiveMinutesAgo);

    const range = req.query.range || '7d';
    let timezone = req.query.timezone || 'UTC';
    const tzMap = {
        '(GMT+05:30) Chennai, Kolkata, Mumbai, New Delhi': 'Asia/Kolkata',
        '(GMT+00:00) UTC': 'UTC',
        '(GMT-05:00) Eastern Time (US & Canada)': 'America/New_York',
        '(GMT-08:00) Pacific Time (US & Canada)': 'America/Los_Angeles'
    };
    if (tzMap[timezone]) timezone = tzMap[timezone];

    let startDate = new Date();
    if (range === '24h') startDate.setHours(startDate.getHours() - 24);
    else if (range === '30d') startDate.setDate(startDate.getDate() - 29);
    else startDate.setDate(startDate.getDate() - 6);
    const startDateStr = startDate.toISOString();

    const { data: dailyViews } = await supabase
        .from('page_views')
        .select('created_at')
        .eq('project_id', project.id)
        .gte('created_at', startDateStr);

    const trafficMap = {};
    if (range === '24h') {
        for (let i = 23; i >= 0; i--) {
            const d = new Date();
            d.setHours(d.getHours() - i);
            const dateInTz = new Date(d.toLocaleString('en-US', { timeZone: timezone }));
            const key = dateInTz.getFullYear() + '-' + String(dateInTz.getMonth() + 1).padStart(2, '0') + '-' + String(dateInTz.getDate()).padStart(2, '0') + ' ' + String(dateInTz.getHours()).padStart(2, '0') + ':00';
            trafficMap[key] = 0;
        }
    } else {
        const days = range === '30d' ? 29 : 6;
        for (let i = days; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateInTz = new Date(d.toLocaleString('en-US', { timeZone: timezone }));
            const key = dateInTz.getFullYear() + '-' + String(dateInTz.getMonth() + 1).padStart(2, '0') + '-' + String(dateInTz.getDate()).padStart(2, '0');
            trafficMap[key] = 0;
        }
    }

    dailyViews?.forEach(v => {
        const dateInTz = new Date(new Date(v.created_at).toLocaleString('en-US', { timeZone: timezone }));
        let key = range === '24h'
            ? dateInTz.getFullYear() + '-' + String(dateInTz.getMonth() + 1).padStart(2, '0') + '-' + String(dateInTz.getDate()).padStart(2, '0') + ' ' + String(dateInTz.getHours()).padStart(2, '0') + ':00'
            : dateInTz.getFullYear() + '-' + String(dateInTz.getMonth() + 1).padStart(2, '0') + '-' + String(dateInTz.getDate()).padStart(2, '0');
        if (trafficMap[key] !== undefined) trafficMap[key]++;
    });

    const trafficData = Object.keys(trafficMap).map(key => {
        const [datePart, timePart] = key.split(' ');
        const [year, month, day] = datePart.split('-').map(Number);
        const hour = timePart ? parseInt(timePart.split(':')[0]) : 0;
        const localDate = new Date(year, month - 1, day, hour);
        let name = range === '24h' ? localDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : range === '30d' ? localDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : localDate.toLocaleDateString('en-US', { weekday: 'short' });
        return { name, views: trafficMap[key], fullDate: key };
    }).sort((a, b) => a.fullDate.localeCompare(b.fullDate));

    const activityLimit = Math.min(parseInt(req.query.limit) || 50, 100);
    const { data: recentActivity } = await supabase
        .from('page_views')
        .select('*, visitors(ip_address, device_type, browser, os, city, country)')
        .eq('project_id', project.id)
        .order('created_at', { ascending: false })
        .limit(activityLimit);

    const activityList = await Promise.all((recentActivity || []).map(async v => {
        const visitor = v.visitors || {};
        const location = [visitor.city, visitor.country].filter(c => c && c !== 'Unknown').join(', ') || 'Unknown Location';
        let path = '/';
        try { path = new URL(v.page_url).pathname; } catch (e) { path = v.page_url || '/'; }

        let lat = null;
        let lng = null;
        if (visitor.ip_address) {
            const geo = await getHighAccuracyGeo(visitor.ip_address);
            lat = geo.lat;
            lng = geo.lng;
        }

        return { id: v.id, type: 'view', location, ip: visitor.ip_address, lat, lng, path, title: v.title, timestamp: v.created_at, device: visitor.device_type, browser: visitor.browser, os: visitor.os };
    }));

    const { data: sources } = await supabase
        .from('visitors')
        .select('referrer')
        .eq('project_id', project.id)
        .gte('last_seen', startDateStr);

    const sourceMap = {};
    sources?.forEach(s => {
        let ref = 'Direct';
        if (s.referrer) try { ref = new URL(s.referrer).hostname; } catch (e) { ref = s.referrer; }
        sourceMap[ref] = (sourceMap[ref] || 0) + 1;
    });

    const topReferrers = Object.entries(sourceMap)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5)
        .map((s, i) => ({ ...s, color: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'][i] || '#CBD5E1' }));

    const { count: uniqueVisitors } = await supabase
        .from('visitors')
        .select('*', { count: 'exact', head: true })
        .eq('project_id', project.id)
        .gte('last_seen', startDateStr);

    const { data: devices } = await supabase
        .from('visitors')
        .select('device_type')
        .eq('project_id', project.id)
        .gte('last_seen', startDateStr);

    const deviceMap = {};
    devices?.forEach(d => {
        const type = d.device_type || 'desktop';
        deviceMap[type] = (deviceMap[type] || 0) + 1;
    });

    const deviceStats = Object.keys(deviceMap).map(key => ({
        name: key.charAt(0).toUpperCase() + key.slice(1),
        value: deviceMap[key],
        color: key === 'desktop' ? '#3B82F6' : key === 'mobile' ? '#10B981' : '#F59E0B'
    }));

    const { data: pages } = await supabase
        .from('page_views')
        .select('page_url, title')
        .eq('project_id', project.id)
        .gte('created_at', startDateStr);

    const pageMap = {};
    pages?.forEach(p => {
        try {
            const path = new URL(p.page_url).pathname;
            if (!pageMap[path]) pageMap[path] = { views: 0, title: p.title || path };
            pageMap[path].views++;
            if (p.title && p.title !== 'Unknown Page') pageMap[path].title = p.title;
        } catch (e) {
            if (!pageMap[p.page_url]) pageMap[p.page_url] = { views: 0, title: p.title || p.page_url };
            pageMap[p.page_url].views++;
        }
    });

    const topPages = Object.entries(pageMap)
        .map(([url, data]) => ({ url, views: data.views, title: data.title }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 5);

    res.json({
        realTimeVisitors: realTimeVisitors || 0,
        trafficData,
        activityList,
        topReferrers,
        uniqueVisitors: uniqueVisitors || 0,
        deviceStats,
        topPages
    });
});

/**
 * Serves a dynamic, pre-configured tracking script for a specific project.
 * Supports both legacy and new functional-style SDK.
 */
export const getTrackerScript = asyncHandler(async (req, res) => {
    try {
        const { trackingId } = req.params;
        
        // Use Host header to determine the full API URL
        const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
        const host = req.headers['x-forwarded-host'] || req.get('host');
        const apiBaseUrl = `${protocol}://${host}/api/v1`;

        const scriptText = `(function () {
  let apiKey = "${trackingId || ''}";

  function sendEvent(eventName, data = {}) {
    const payload = {
      event: eventName,
      url: window.location.href,
      referrer: document.referrer,
      userAgent: navigator.userAgent,
      timestamp: Date.now(),
      ...data
    };

    if (navigator.sendBeacon) {
      navigator.sendBeacon("${apiBaseUrl}/track/events", JSON.stringify(payload));
    } else {
      fetch("${apiBaseUrl}/track/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey
        },
        body: JSON.stringify(payload),
        keepalive: true
      }).catch(() => {});
    }
  }

  function handleCall(action, ...args) {
    if (action === "init") {
      apiKey = args[0];
    }

    if (action === "track") {
      sendEvent(args[0], args[1] || {});
    }
  }

  window.tracker = function (...args) {
    handleCall(...args);
  };

  // Auto-initialize if trackingId was provided in the URL
  if (apiKey) {
    handleCall("track", "page_view");
  }
})();`;

        res.setHeader('Content-Type', 'application/javascript');
        res.setHeader('Cache-Control', 'public, max-age=3600');
        res.send(scriptText);
    } catch (error) {
        console.error('Script generation error:', error);
        res.status(500).send('console.error("Tracking script failed to load");');
    }
});

/**
 * Standard SaaS Event Tracking Endpoint (POST /v1/events)
 * Uses x-api-key header or body tracking_id for authentication.
 */
export const trackEvent = asyncHandler(async (req, res) => {
    const apiKey = req.headers['x-api-key'] || req.body?.tracking_id || req.body?.trackingId || req.body?.apiKey;
    if (!apiKey) throw AppError.unauthorized('Missing API key or tracking ID');

    const {
        event,
        type = 'event',
        url,
        pageUrl,
        path: bodyPath,
        referrer,
        title,
        userAgent: bodyUA,
        session_id,
        sessionId,
        category,
        properties,
        ...customData
    } = req.body || {};

    const userAgent = bodyUA || req.headers['user-agent'] || '';
    const ip = getClientIp(req);

    // 1. Bot Filtering
    if (isBot(userAgent, req)) {
        return res.json({ success: true, bot: true });
    }

    // 2. Fetch Project (Support API keys table, tracking_id, or UUID)
    let project = null;
    if (apiKey.startsWith('wpk_') || apiKey.length > 30) {
        const prefix = apiKey.substring(0, 8);
        const hash = crypto.createHash('sha256').update(apiKey).digest('hex');
        const { data: keyRecord } = await supabase
            .from('api_keys')
            .select('project_id, revoked_at, expires_at')
            .eq('key_prefix', prefix)
            .eq('key_hash', hash)
            .maybeSingle();

        if (keyRecord && !keyRecord.revoked_at && (!keyRecord.expires_at || new Date(keyRecord.expires_at) > new Date())) {
            const { data: proj } = await supabase
                .from('projects')
                .select('id, user_id, allowed_origins, is_active')
                .eq('id', keyRecord.project_id)
                .single();
            project = proj;
            await supabase.from('api_keys').update({ last_used_at: new Date() }).eq('key_hash', hash);
        }
    }

    if (!project) {
        const isProjectUuid = isUuid(apiKey);
        const { data: proj } = await supabase
            .from('projects')
            .select('id, user_id, allowed_origins, is_active')
            .or(`tracking_id.eq.${apiKey}${isProjectUuid ? `,id.eq.${apiKey}` : ''}`)
            .maybeSingle();
        project = proj;
    }

    if (!project) {
        throw AppError.notFound('Invalid API key or tracking ID', 'INVALID_API_KEY');
    }

    if (project.is_active === false) {
        throw AppError.forbidden('Project is disabled');
    }

    // Check limits
    const limitCheck = await usageService.checkLimit(project.user_id);
    if (!limitCheck.canTrack) {
        throw AppError.limitExceeded(limitCheck.reason);
    }

    // Deduplication
    const hitHash = generateHitHash(ip, userAgent, apiKey);
    const now = Date.now();
    if (requestCache.has(hitHash)) {
        const lastHit = requestCache.get(hitHash);
        if (now - lastHit < 1000) return res.json({ success: true, ignored: 'DUPLICATE_HIT' });
    }
    requestCache.set(hitHash, now);

    const hit = await recordAnalyticsHit({
        project,
        ip,
        userAgent,
        type: type || (event ? 'event' : 'pageview'),
        pageUrl: url || pageUrl || bodyPath || '/',
        title: title || (event ? `Event: ${event}` : 'API Event'),
        referrer,
        eventName: event,
        eventCategory: category || 'custom',
        properties: properties || customData || {},
        customSessionId: session_id || sessionId || hitHash.substring(0, 20),
        req
    });

    res.json({ success: true, event: event || 'pageview' });
});

/**
 * Standard SaaS Analytics Count Endpoint (GET /v1/analytics/count)
 * Uses x-api-key header for authentication.
 */
export const getEventCount = asyncHandler(async (req, res) => {
    const apiKey = req.headers['x-api-key'];
    const urlParam = req.query.url;

    if (!apiKey) throw AppError.unauthorized('Missing API key');

    const { data: project } = await supabase
        .from('projects')
        .select('id')
        .eq('tracking_id', apiKey)
        .single();

    if (!project) throw AppError.notFound('Invalid API key');

    let count = 0;
    if (urlParam) {
        // Count views for specific URL
        const { count: pageCount } = await supabase
            .from('page_views')
            .select('*', { count: 'exact', head: true })
            .eq('project_id', project.id)
            .ilike('page_url', `%${urlParam}%`);
        count = pageCount || 0;
    } else {
        // Get total count from counter table
        const { data: counter } = await supabase
            .from('counters')
            .select('count')
            .eq('project_id', project.id)
            .single();
        count = counter?.count || 0;
    }

    res.json({ count });
});

export default {
    trackVisitor,
    getLiveVisitors,
    getDashboardStats,
    trackVisitorPublic,
    getVisitorCountPublic,
    getProjectDetailedStats,
    getTrackerScript,
    trackEvent,
    getEventCount
};