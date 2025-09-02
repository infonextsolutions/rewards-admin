import { useState } from 'react';

export function AddEditModal({ 
  isOpen, 
  activeTab, 
  editingItem, 
  onClose, 
  onSave 
}) {
  const [formData, setFormData] = useState({
    // XP Tiers
    tierName: editingItem?.tierName || '',
    xpMin: editingItem?.xpMin || '',
    xpMax: editingItem?.xpMax || '',
    badge: editingItem?.badge || '',
    accessBenefits: editingItem?.accessBenefits || '',
    status: editingItem?.status ?? true,
    // XP Decay Settings
    decayRuleType: editingItem?.decayRuleType || 'Fixed',
    inactivityDuration: editingItem?.inactivityDuration || '',
    minimumXpLimit: editingItem?.minimumXpLimit || '',
    notificationToggle: editingItem?.notificationToggle ?? true,
    // XP Conversion
    tier: editingItem?.tierName || '',
    conversionRatio: editingItem?.conversionRatio || '',
    enabled: editingItem?.enabled ?? true,
    redemptionChannels: editingItem?.redemptionChannels || [],
    // Bonus Logic
    bonusType: editingItem?.bonusType || '',
    triggerCondition: editingItem?.triggerCondition || '',
    rewardValue: editingItem?.rewardValue || '',
    active: editingItem?.active ?? true
  });

  const [formErrors, setFormErrors] = useState({});

  const handleSubmit = () => {
    const errors = {};
    
    // Basic validation
    if (activeTab === 'XP Tiers') {
      if (!formData.tierName) errors.tierName = 'Tier name is required';
      if (!formData.xpMin) errors.xpMin = 'Min XP is required';
      if (!formData.xpMax) errors.xpMax = 'Max XP is required';
    }
    
    if (activeTab === 'Bonus Logic') {
      if (!formData.bonusType) errors.bonusType = 'Bonus type is required';
      if (!formData.triggerCondition) errors.triggerCondition = 'Trigger condition is required';
      if (!formData.rewardValue) errors.rewardValue = 'Reward value is required';
    }

    setFormErrors(errors);
    
    if (Object.keys(errors).length === 0) {
      onSave(formData);
    }
  };

  const resetForm = () => {
    setFormData({
      tierName: '', xpMin: '', xpMax: '', badge: '', accessBenefits: '', status: true,
      decayRuleType: 'Fixed', inactivityDuration: '', minimumXpLimit: '', notificationToggle: true,
      tier: '', conversionRatio: '', enabled: true, redemptionChannels: [],
      bonusType: '', triggerCondition: '', rewardValue: '', active: true
    });
    setFormErrors({});
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-6 text-black">
            {editingItem ? `Edit ${activeTab}` : `Add New ${activeTab}`}
          </h2>

          <div className="space-y-4">
            {/* XP Tiers Fields */}
            {activeTab === 'XP Tiers' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    Tier Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.tierName}
                    onChange={(e) => setFormData(prev => ({ ...prev, tierName: e.target.value }))}
                    placeholder="e.g., Bronze, Silver, Gold"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                  />
                  {formErrors.tierName && <p className="text-red-500 text-xs mt-1">{formErrors.tierName}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-black mb-1">
                      Min XP <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.xpMin}
                      onChange={(e) => setFormData(prev => ({ ...prev, xpMin: parseInt(e.target.value) }))}
                      placeholder="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                    />
                    {formErrors.xpMin && <p className="text-red-500 text-xs mt-1">{formErrors.xpMin}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-1">
                      Max XP <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.xpMax}
                      onChange={(e) => setFormData(prev => ({ ...prev, xpMax: parseInt(e.target.value) }))}
                      placeholder="999"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                    />
                    {formErrors.xpMax && <p className="text-red-500 text-xs mt-1">{formErrors.xpMax}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-1">Badge</label>
                  <input
                    type="text"
                    value={formData.badge}
                    onChange={(e) => setFormData(prev => ({ ...prev, badge: e.target.value }))}
                    placeholder="🥉"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-1">Access Benefits</label>
                  <textarea
                    value={formData.accessBenefits}
                    onChange={(e) => setFormData(prev => ({ ...prev, accessBenefits: e.target.value }))}
                    placeholder="Describe the benefits for this tier..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="status"
                    checked={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="status" className="text-sm font-medium text-black">Active</label>
                </div>
              </>
            )}

            {/* XP Decay Settings Fields */}
            {activeTab === 'XP Decay Settings' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-black mb-1">Tier Name</label>
                  <input
                    type="text"
                    value={formData.tierName}
                    onChange={(e) => setFormData(prev => ({ ...prev, tierName: e.target.value }))}
                    placeholder="Bronze, Silver, Gold..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-1">Decay Rule Type</label>
                  <select
                    value={formData.decayRuleType}
                    onChange={(e) => setFormData(prev => ({ ...prev, decayRuleType: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                  >
                    <option value="Fixed">Fixed</option>
                    <option value="Stepwise">Stepwise</option>
                    <option value="Gradual">Gradual</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-black mb-1">Inactivity Duration</label>
                    <input
                      type="text"
                      value={formData.inactivityDuration}
                      onChange={(e) => setFormData(prev => ({ ...prev, inactivityDuration: e.target.value }))}
                      placeholder="7 Days"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-1">Min XP Limit</label>
                    <input
                      type="number"
                      value={formData.minimumXpLimit}
                      onChange={(e) => setFormData(prev => ({ ...prev, minimumXpLimit: parseInt(e.target.value) }))}
                      placeholder="100"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="notifications"
                    checked={formData.notificationToggle}
                    onChange={(e) => setFormData(prev => ({ ...prev, notificationToggle: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="notifications" className="text-sm font-medium text-black">Enable Notifications</label>
                </div>
              </>
            )}

            {/* Bonus Logic Fields */}
            {activeTab === 'Bonus Logic' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    Bonus Type <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.bonusType}
                    onChange={(e) => setFormData(prev => ({ ...prev, bonusType: e.target.value }))}
                    placeholder="Login Streak, Referral, Daily Task..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                  />
                  {formErrors.bonusType && <p className="text-red-500 text-xs mt-1">{formErrors.bonusType}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    Trigger Condition <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.triggerCondition}
                    onChange={(e) => setFormData(prev => ({ ...prev, triggerCondition: e.target.value }))}
                    placeholder="7 consecutive logins, Complete daily objectives..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                  />
                  {formErrors.triggerCondition && <p className="text-red-500 text-xs mt-1">{formErrors.triggerCondition}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    Reward Value <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.rewardValue}
                    onChange={(e) => setFormData(prev => ({ ...prev, rewardValue: e.target.value }))}
                    placeholder="500 XP, 1000 Coins, ₹50..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                  />
                  {formErrors.rewardValue && <p className="text-red-500 text-xs mt-1">{formErrors.rewardValue}</p>}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="active"
                    checked={formData.active}
                    onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="active" className="text-sm font-medium text-black">Active</label>
                </div>
              </>
            )}
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={() => {
                onClose();
                resetForm();
              }}
              className="px-4 py-2 text-black border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {editingItem ? 'Save Changes' : 'Add Item'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function DeleteConfirmModal({ 
  isOpen, 
  activeTab, 
  deletingItem, 
  onClose, 
  onConfirm 
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h2 className="text-xl font-semibold mb-4 text-red-600">
          Delete {activeTab.slice(0, -1)}
        </h2>
        <p className="text-black mb-6">
          Are you sure you want to delete <strong>{deletingItem?.tierName || deletingItem?.bonusType || 'this item'}</strong>? 
          This action cannot be undone and may affect users or system functionality.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-black border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}