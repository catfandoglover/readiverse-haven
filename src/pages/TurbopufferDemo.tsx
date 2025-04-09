import { TurbopufferExample } from '../components/TurbopufferExample';

export default function TurbopufferDemo() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Turbopuffer Vector Database Demo</h1>
      <div className="bg-white rounded-lg shadow-md p-6">
        <TurbopufferExample />
      </div>
    </div>
  );
} 