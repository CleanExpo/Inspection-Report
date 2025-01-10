'use client';

import React, { useState } from 'react';

interface Environment {
  id: string;
  name: string;
  variables: Record<string, string>;
}

interface EnvironmentManagerProps {
  environments: Environment[];
  activeEnvironment: string | null;
  onEnvironmentChange: (environmentId: string | null) => void;
  onSaveEnvironment: (environment: Omit<Environment, 'id'>) => void;
  onUpdateEnvironment: (environment: Environment) => void;
  onDeleteEnvironment: (environmentId: string) => void;
}

export function EnvironmentManager({
  environments,
  activeEnvironment,
  onEnvironmentChange,
  onSaveEnvironment,
  onUpdateEnvironment,
  onDeleteEnvironment,
}: EnvironmentManagerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editingEnvironment, setEditingEnvironment] = useState<Environment | null>(null);

  const handleStartEdit = (environment?: Environment) => {
    setIsEditing(true);
    setEditingEnvironment(
      environment || {
        id: '',
        name: '',
        variables: {},
      }
    );
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingEnvironment(null);
  };

  const handleSave = () => {
    if (!editingEnvironment) return;

    if (editingEnvironment.id) {
      onUpdateEnvironment(editingEnvironment);
    } else {
      onSaveEnvironment({
        name: editingEnvironment.name,
        variables: editingEnvironment.variables,
      });
    }

    setIsEditing(false);
    setEditingEnvironment(null);
  };

  const handleAddVariable = () => {
    if (!editingEnvironment) return;

    setEditingEnvironment({
      ...editingEnvironment,
      variables: {
        ...editingEnvironment.variables,
        '': '',
      },
    });
  };

  const handleVariableChange = (oldKey: string, key: string, value: string) => {
    if (!editingEnvironment) return;

    const newVariables = { ...editingEnvironment.variables };
    if (oldKey !== key) {
      delete newVariables[oldKey];
    }
    newVariables[key] = value;

    setEditingEnvironment({
      ...editingEnvironment,
      variables: newVariables,
    });
  };

  const handleRemoveVariable = (key: string) => {
    if (!editingEnvironment) return;

    const newVariables = { ...editingEnvironment.variables };
    delete newVariables[key];

    setEditingEnvironment({
      ...editingEnvironment,
      variables: newVariables,
    });
  };

  if (isEditing) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">
            {editingEnvironment?.id ? 'Edit Environment' : 'New Environment'}
          </h3>
          <button
            onClick={handleCancelEdit}
            className="text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Environment Name
            </label>
            <input
              type="text"
              value={editingEnvironment?.name || ''}
              onChange={(e) =>
                setEditingEnvironment(prev =>
                  prev ? { ...prev, name: e.target.value } : null
                )
              }
              className="w-full px-3 py-2 border rounded"
              placeholder="e.g., Development, Production"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Variables
              </label>
              <button
                onClick={handleAddVariable}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                + Add Variable
              </button>
            </div>
            <div className="space-y-2">
              {editingEnvironment &&
                Object.entries(editingEnvironment.variables).map(([key, value], index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={key}
                      onChange={(e) =>
                        handleVariableChange(key, e.target.value, value)
                      }
                      placeholder="Variable name"
                      className="flex-1 px-3 py-2 border rounded"
                    />
                    <input
                      type="text"
                      value={value}
                      onChange={(e) =>
                        handleVariableChange(key, key, e.target.value)
                      }
                      placeholder="Value"
                      className="flex-1 px-3 py-2 border rounded"
                    />
                    <button
                      onClick={() => handleRemoveVariable(key)}
                      className="px-3 py-2 text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>
                ))}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={!editingEnvironment?.name}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300"
            >
              Save Environment
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <select
            value={activeEnvironment || ''}
            onChange={(e) => onEnvironmentChange(e.target.value || null)}
            className="px-3 py-2 border rounded"
          >
            <option value="">No Environment</option>
            {environments.map((env) => (
              <option key={env.id} value={env.id}>
                {env.name}
              </option>
            ))}
          </select>
          <button
            onClick={() => handleStartEdit()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            New Environment
          </button>
        </div>
      </div>

      {activeEnvironment && (
        <div className="border rounded p-4">
          {environments
            .filter((env) => env.id === activeEnvironment)
            .map((env) => (
              <div key={env.id}>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">{env.name}</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleStartEdit(env)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDeleteEnvironment(env.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  {Object.entries(env.variables).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center">
                      <span className="font-mono text-sm">{key}</span>
                      <span className="text-gray-600">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
