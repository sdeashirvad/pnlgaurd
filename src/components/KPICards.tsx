import { Upload, AlertTriangle, Activity, Clock } from 'lucide-react';

interface KPICardsProps {
  recordsUploaded: number;
  anomaliesDetected: number;
  maxDeviation: number;
  lastCalculationRun: string | null;
}

export function KPICards({
  recordsUploaded,
  anomaliesDetected,
  maxDeviation,
  lastCalculationRun,
}: KPICardsProps) {
  const cards = [
    {
      label: 'Records Uploaded',
      value: recordsUploaded.toLocaleString(),
      icon: Upload,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-100',
    },
    {
      label: 'Anomalies Detected',
      value: anomaliesDetected.toLocaleString(),
      icon: AlertTriangle,
      color: 'text-red-600',
      bg: 'bg-red-50',
      border: 'border-red-100',
    },
    {
      label: 'Max Deviation',
      value: maxDeviation.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
      }),
      icon: Activity,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      border: 'border-purple-100',
    },
    {
      label: 'Last Calculation',
      value: lastCalculationRun ? new Date(lastCalculationRun).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Never',
      icon: Clock,
      color: 'text-green-600',
      bg: 'bg-green-50',
      border: 'border-green-100',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`bg-white rounded-xl shadow-sm border ${card.border} p-5 flex items-center space-x-4 hover:shadow-md transition-shadow duration-200`}
        >
          <div className={`p-3 rounded-lg ${card.bg}`}>
            <card.icon className={`w-6 h-6 ${card.color}`} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">{card.label}</p>
            <p className="text-xl font-bold text-gray-900 tracking-tight">{card.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
