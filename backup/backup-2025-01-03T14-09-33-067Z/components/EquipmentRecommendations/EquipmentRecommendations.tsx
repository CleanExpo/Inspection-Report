import React, { useState } from "react";

interface Equipment {
  type: string;
  quantity: number;
  placement: string;
  duration: number;
}

const EquipmentRecommendations = ({ jobNumber }: { jobNumber: string }) => {
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [newEquipment, setNewEquipment] = useState<Equipment>({
    type: "",
    quantity: 1,
    placement: "",
    duration: 1,
  });

  const equipmentTypes = [
    "Dehumidifier",
    "Air Mover",
    "Air Scrubber",
    "Heater",
    "Negative Air Machine",
  ];

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const value = e.target.type === "number" ? Number(e.target.value) : e.target.value;
    setNewEquipment({ ...newEquipment, [e.target.name]: value });
  };

  const handleAddEquipment = () => {
    if (!newEquipment.type || !newEquipment.placement) {
      alert("Please fill in all fields");
      return;
    }
    setEquipmentList([...equipmentList, newEquipment]);
    setNewEquipment({ type: "", quantity: 1, placement: "", duration: 1 });
  };

  const handleSave = async () => {
    try {
      const response = await fetch("/api/saveEquipment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ jobNumber, equipmentList }),
      });

      if (!response.ok) {
        throw new Error("Failed to save equipment recommendations");
      }

      alert("Equipment recommendations saved successfully!");
    } catch (error) {
      console.error(error);
      alert("Error saving equipment recommendations");
    }
  };

  return (
    <div className="p-4 border rounded shadow">
      <form className="mb-4" onSubmit={(e) => e.preventDefault()}>
        {/* Equipment Type */}
        <label className="block mb-2">
          Equipment Type:
          <select
            name="type"
            value={newEquipment.type}
            onChange={handleInputChange}
            className="border rounded px-2 py-1 w-full"
          >
            <option value="">Select Equipment Type</option>
            {equipmentTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>

        {/* Quantity */}
        <label className="block mb-2">
          Quantity:
          <input
            type="number"
            name="quantity"
            value={newEquipment.quantity}
            onChange={handleInputChange}
            className="border rounded px-2 py-1 w-full"
            min={1}
          />
        </label>

        {/* Placement Area */}
        <label className="block mb-2">
          Placement Area:
          <input
            type="text"
            name="placement"
            value={newEquipment.placement}
            onChange={handleInputChange}
            className="border rounded px-2 py-1 w-full"
            placeholder="Enter Placement Area"
          />
        </label>

        {/* Duration */}
        <label className="block mb-2">
          Usage Duration (Days):
          <input
            type="number"
            name="duration"
            value={newEquipment.duration}
            onChange={handleInputChange}
            className="border rounded px-2 py-1 w-full"
            min={1}
          />
        </label>

        <button
          type="button"
          onClick={handleAddEquipment}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded mt-2"
        >
          Add Equipment
        </button>
      </form>

      {/* Equipment List */}
      <div className="mt-6">
        <h2 className="text-lg font-bold mb-2">Equipment List</h2>
        {equipmentList.length === 0 ? (
          <p className="text-gray-500">No equipment added yet</p>
        ) : (
          <ul className="space-y-2">
            {equipmentList.map((equipment, index) => (
              <li key={index} className="p-2 bg-gray-50 rounded">
                <strong>{equipment.type}</strong> ({equipment.quantity} units)
                <br />
                <span className="text-gray-600">
                  Placement: {equipment.placement}
                  <br />
                  Duration: {equipment.duration} days
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <button
        type="button"
        onClick={handleSave}
        disabled={equipmentList.length === 0}
        className={`px-4 py-2 rounded mt-4 ${
          equipmentList.length === 0
            ? 'bg-gray-300 cursor-not-allowed'
            : 'bg-green-500 hover:bg-green-600 text-white'
        }`}
      >
        Save Equipment Recommendations
      </button>
    </div>
  );
};

export default EquipmentRecommendations;
