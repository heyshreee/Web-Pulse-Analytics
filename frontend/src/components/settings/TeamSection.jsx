import { Card, CardBody } from '../ui/Card';
import { EmptyState } from '../ui/State';

export default function TeamSection() {
  return (
    <Card>
      <CardBody>
        <EmptyState
          icon="users"
          title="Team management is not available yet"
          text="Inviting teammates, assigning roles, and transferring ownership aren’t enabled in this release. Access control will arrive with project members and permissions."
        />
      </CardBody>
    </Card>
  );
}
