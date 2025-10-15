
import Container from "./Container";
export default function Footer(){
  return (
    <footer className="mt-16 border-t border-ink-100 py-10 text-sm text-ink-600">
      <Container>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} Aviva Insurance</p>
        </div>
      </Container>
    </footer>
  );
}