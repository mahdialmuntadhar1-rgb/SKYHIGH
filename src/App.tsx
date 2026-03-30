/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Layout } from './components/Layout';
import { RunPage } from './components/RunPage';
import { ResultsPage } from './components/ResultsPage';

export default function App() {
  const [currentPage, setCurrentPage] = useState<'run' | 'results'>('run');

  return (
    <Layout currentPage={currentPage} onPageChange={setCurrentPage}>
      {currentPage === 'run' ? <RunPage /> : <ResultsPage />}
    </Layout>
  );
}

