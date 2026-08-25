import { useParams } from 'react-router-dom';

export default function Product() {
  const { id } = useParams();

  return (
    <main className="container" style={{ paddingTop: '40px', paddingBottom: '40px' }}>
      <h1>Product Details</h1>
      <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>
        Product #{id} — This page will be built in a future phase.
      </p>
    </main>
  );
}
