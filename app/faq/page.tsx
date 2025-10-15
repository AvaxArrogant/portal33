import Container from "@/components/Container";

export default function FaqPage() {
  return (
    <Container>
      <h1 className="text-2xl font-extrabold mt-6 mb-4">Frequently Asked Questions</h1>
      <div className="space-y-8">
        <div>
          <h2 className="text-xl font-bold">How do I view my policy details?</h2>
          <p>You can view your policy details by navigating to the "Policies" page from the main menu. Click on a policy to see its details.</p>
        </div>
        <div>
          <h2 className="text-xl font-bold">How do I download my policy documents?</h2>
          <p>On the policy details page, you will find a "Download Policy" button. Click this button to download a PDF copy of your policy documents.</p>
        </div>
        <div>
          <h2 className="text-xl font-bold">How do I update my personal information?</h2>
          <p>To update your personal information, please contact our customer support team. They will be happy to assist you.</p>
        </div>
        <div>
          <h2 className="text-xl font-bold">How do I file a claim?</h2>
          <p>To file a claim, please contact our claims department. You can find their contact information on our website.</p>
        </div>
      </div>
    </Container>
  );
}