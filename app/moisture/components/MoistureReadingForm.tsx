import { useState, useEffect } from 'react';
import { Equipment, MoistureUnit } from '@prisma/client';

interface MoistureReadingFormProps {
  jobId: string;
  onSubmit: (data: MoistureReadingInput) => Promise<void>;
}

interface DataPoint {
  value: number;
  unit: MoistureUnit;
  timestamp: string;
  depth?: number;
}

interface MoistureReadingInput {
  jobId: string;
  locationX: number;
  locationY: number;
  room: string;
  floor: number;
  notes?: string;
  dataPoints: DataPoint[];
  equipmentId: string;
  temperature?: number;
  humidity?: number;
  pressure?: number;
}

export default function MoistureReadingForm({ jobId, onSubmit }: MoistureReadingFormProps) {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<Omit<MoistureReadingInput, 'dataPoints' | 'equipmentId'>>({
    jobId,
    locationX: 0,
    locationY: 0,
    room: '',
    floor: 0,
    notes: '',
    temperature: undefined,
    humidity: undefined,
    pressure: undefined
  });

  const [dataPoints, setDataPoints] = useState<DataPoint[]>([{
    value: 0,
    unit: 'WME',
    timestamp: new Date().toISOString(),
    depth: undefined
  }]);

  // Fetch available equipment
  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        const response = await fetch('/api/moisture/equipment?status=ACTIVE&type=MOISTURE_METER');
        if (!response.ok) throw new Error('Failed to fetch equipment');
        const data = await response.json();
        setEquipment(data);
      } catch (err) {
        setError('Failed to load equipment');
        console.error('Equipment fetch error:', err);
      }
    };

    fetchEquipment();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: ['floor', 'temperature', 'humidity', 'pressure'].includes(name) 
        ? value === '' ? undefined : parseFloat(value)
        : value
    }));
  };

  const handleDataPointChange = (index: number, field: keyof DataPoint, value: string | number) => {
    setDataPoints(prev => prev.map((point, i) => {
      if (i === index) {
        return {
          ...point,
          [field]: field === 'value' || field === 'depth' ? Number(value) : value,
          timestamp: new Date().toISOString() // Update timestamp on any change
        };
      }
      return point;
    }));
  };

  const addDataPoint = () => {
    setDataPoints(prev => [...prev, {
      value: 0,
      unit: 'WME',
      timestamp: new Date().toISOString(),
      depth: undefined
    }]);
  };

  const removeDataPoint = (index: number) => {
    setDataPoints(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate equipment selection
    if (!selectedEquipment) {
      setError('Please select equipment before submitting');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await onSubmit({
        ...formData,
        dataPoints,
        equipmentId: selectedEquipment
      });
      
      // Reset form after successful submission
      setFormData(prev => ({
        ...prev,
        locationX: 0,
        locationY: 0,
        room: '',
        notes: '',
        temperature: undefined,
        humidity: undefined,
        pressure: undefined
      }));
      setDataPoints([{
        value: 0,
        unit: 'WME',
        timestamp: new Date().toISOString(),
        depth: undefined
      }]);
      setSelectedEquipment(''); // Reset equipment selection
    } catch (err) {
      setError('Failed to save reading');
      console.error('Submit error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto p-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Equipment
          </label>
          <select
            value={selectedEquipment}
            onChange={(e) => setSelectedEquipment(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          >
            <option value="">Select Equipment</option>
            {equipment.map((eq) => (
              <option key={eq.id} value={eq.id}>
                {eq.model} - {eq.serialNumber}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Location X
            </label>
            <input
              type="number"
              name="locationX"
              value={formData.locationX}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
              step="0.01"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Location Y
            </label>
            <input
              type="number"
              name="locationY"
              value={formData.locationY}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
              step="0.01"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Room
          </label>
          <input
            type="text"
            name="room"
            value={formData.room}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
            maxLength={50}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Floor
          </label>
          <input
            type="number"
            name="floor"
            value={formData.floor}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Notes
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        {/* Environmental Metadata */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Temperature (°C)
            </label>
            <input
              type="number"
              name="temperature"
              value={formData.temperature ?? ''}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              step="0.1"
              placeholder="Enter temperature..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Humidity (%)
            </label>
            <input
              type="number"
              name="humidity"
              value={formData.humidity ?? ''}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              step="0.1"
              min="0"
              max="100"
              placeholder="Enter humidity..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Pressure (hPa)
            </label>
            <input
              type="number"
              name="pressure"
              value={formData.pressure ?? ''}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              step="0.1"
              placeholder="Enter pressure..."
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Data Points</h3>
            <button
              type="button"
              onClick={addDataPoint}
              className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
            >
              Add Point
            </button>
          </div>

          {dataPoints.map((point, index) => (
            <div key={index} className="p-4 border rounded-lg space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Value
                  </label>
                  <input
                    type="number"
                    value={point.value}
                    onChange={(e) => handleDataPointChange(index, 'value', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Unit
                  </label>
                  <select
                    value={point.unit}
                    onChange={(e) => handleDataPointChange(index, 'unit', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  >
                    <option value="WME">WME</option>
                    <option value="REL">REL</option>
                    <option value="PCT">PCT</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Depth (optional)
                </label>
                <input
                  type="number"
                  value={point.depth || ''}
                  onChange={(e) => handleDataPointChange(index, 'depth', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  step="0.1"
                  placeholder="Enter depth..."
                />
              </div>

              {dataPoints.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeDataPoint(index)}
                  className="text-red-600 text-sm hover:text-red-800"
                >
                  Remove Point
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {loading ? 'Saving...' : 'Save Reading'}
        </button>
      </div>
    </form>
  );
}
