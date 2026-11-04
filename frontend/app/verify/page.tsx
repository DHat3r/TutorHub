import { Suspense } from 'react';
import VerifyClient from './VerifyClient';

// useSearchParams necesita un Suspense alrededor para que Next pueda compilar la página
// (el build original fallaba aquí). Mismo patrón que reset-password.
export default function Page() {
  return (
    <Suspense fallback={<p>Cargando...</p>}>
      <VerifyClient />
    </Suspense>
  );
}
