import { Card, CardBody } from '../ui/Card';
import { EmptyState } from '../ui/State';

export default function AlertsSection() {
  return (
    <Card>
      <CardBody>
        <EmptyState
          icon="bell"
          title="Alerts are not available yet"
          text="Traffic spike, drop, and tracking-stopped alerts require a rules engine and delivery pipeline that aren’t part of this release."
        />
      </CardBody>
    </Card>
  );
}
