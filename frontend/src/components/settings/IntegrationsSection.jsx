import { Card, CardBody } from '../ui/Card';
import { EmptyState } from '../ui/State';

export default function IntegrationsSection() {
  return (
    <Card>
      <CardBody>
        <EmptyState
          icon="link"
          title="Integrations & API are not available yet"
          text="Managing API keys, webhooks, and third-party connections is being rebuilt on the server. This section will activate once those endpoints ship."
        />
      </CardBody>
    </Card>
  );
}
