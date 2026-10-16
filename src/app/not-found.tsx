export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center px-6 text-center">
      <div>
        <p className="font-display text-7xl font-bold text-brand2">404</p>
        <p className="mt-3 text-muted">Ops, essa página não existe. / This page doesn&apos;t exist.</p>
        <a href="/" className="btn-primary mt-6">Voltar / Back</a>
      </div>
    </main>
  );
}
