'use client';

import React, { useState } from "react";

export default function RewardsPage() {
  const [activeTab, setActiveTab] = useState("XP Tiers");
  const [currentPage, setCurrentPage] = useState(1);
  const [dateRange, setDateRange] = useState("Date Range");
  const [type, setType] = useState("Type");
  const [status, setStatus] = useState("Status");
  
  // XP Tiers state management
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  
  // Universal form state for all tabs
  const [formData, setFormData] = useState({
    // XP Tiers
    tierName: '',
    xpMin: '',
    xpMax: '',
    badge: null,
    accessBenefits: '',
    status: true,
    // XP Decay Settings
    decayRuleType: 'Fixed',
    inactivityDuration: '',
    minimumXpLimit: '',
    notificationToggle: true,
    // XP Conversion
    tier: '',
    conversionRatio: '',
    enabled: true,
    redemptionChannels: [],
    // Bonus Logic
    bonusType: '',
    triggerCondition: '',
    rewardValue: '',
    active: true
  });
  const [formErrors, setFormErrors] = useState({});

  const tabs = [
    { name: "XP Tiers" },
    { name: "XP Decay Settings" },
    { name: "XP Conversion" },
    { name: "Bonus Logic" },
  ];

  const getFilterOptionsForTab = (tab) => {
    const baseFilters = [
      {
        id: "dateRange",
        label: dateRange,
        value: dateRange,
        onChange: setDateRange,
        options: ["Date Range", "Last 7 days", "Last 30 days", "Last 90 days", "Custom"],
      },
      {
        id: "status",
        label: status,
        value: status,
        onChange: setStatus,
        options: ["Status", "All Status", "Active", "Inactive"],
      },
    ];

    switch (tab) {
      case "XP Tiers":
        return [
          ...baseFilters,
          {
            id: "type",
            label: type,
            value: type,
            onChange: setType,
            options: ["Type", "All Types", "Bronze", "Silver", "Gold", "Platinum", "Diamond"],
          },
        ];
      case "XP Decay Settings":
        return [
          ...baseFilters,
          {
            id: "type",
            label: type,
            value: type,
            onChange: setType,
            options: ["Type", "All Types", "Fixed", "Stepwise"],
          },
        ];
      case "XP Conversion":
        return [
          ...baseFilters,
          {
            id: "type",
            label: type,
            value: type,
            onChange: setType,
            options: ["Type", "All Types", "Bronze", "Silver", "Gold", "Platinum"],
          },
        ];
      case "Bonus Logic":
        return [
          ...baseFilters,
          {
            id: "type",
            label: type,
            value: type,
            onChange: setType,
            options: ["Type", "All Types", "Login Streak", "Referral", "Daily Task", "Achievement"],
          },
        ];
      default:
        return baseFilters;
    }
  };

  const [xpTiers, setXpTiers] = useState([
    {
      id: 1,
      tierName: "Bronze",
      tierColor: "#f68d2b",
      bgColor: "#ffefda",
      borderColor: "#c77023",
      iconSrc: "https://c.animaapp.com/mf180vyvQGfAhJ/img/---icon--star--9@2x.png",
      xpMin: 0,
      xpMax: 999,
      xpRange: "0 - 999 XP",
      badge: "🥉",
      badgeFile: null,
      accessBenefits: "Entry-level access",
      status: true,
    },
    {
      id: 2,
      tierName: "Silver",
      tierColor: "#6f85a4",
      bgColor: "#f4f4f4",
      borderColor: "#9aa7b8",
      iconSrc: "https://c.animaapp.com/mf180vyvQGfAhJ/img/---icon--star--1@2x.png",
      xpMin: 1000,
      xpMax: 2999,
      xpRange: "1000 - 2999 XP",
      badge: "🥈",
      badgeFile: null,
      accessBenefits: "Mid-tier access with bonuses",
      status: true,
    },
    {
      id: 3,
      tierName: "Gold",
      tierColor: "#c7a20f",
      bgColor: "#fffddf",
      borderColor: "#f0c92e",
      iconSrc: "https://c.animaapp.com/mf180vyvQGfAhJ/img/---icon--star--5@2x.png",
      xpMin: 3000,
      xpMax: 9999,
      xpRange: "3000 - 9999 XP",
      badge: "🥇",
      badgeFile: null,
      accessBenefits: "Premium access with exclusive rewards",
      status: true,
    },
  ]);

  // XP Decay Settings data
  const [xpDecaySettings, setXpDecaySettings] = useState([
    {
      id: 1,
      tierName: "Bronze",
      xpRange: "0 - 999 XP",
      decayRuleType: "Fixed",
      inactivityDuration: "7 Days",
      minimumXpLimit: 100,
      notificationToggle: true,
      status: true,
    },
    {
      id: 2,
      tierName: "Silver", 
      xpRange: "1000 - 2999 XP",
      decayRuleType: "Stepwise",
      inactivityDuration: "10 Days",
      minimumXpLimit: 200,
      notificationToggle: true,
      status: true,
    },
    {
      id: 3,
      tierName: "Gold",
      xpRange: "3000 - 9999 XP", 
      decayRuleType: "Fixed",
      inactivityDuration: "14 Days",
      minimumXpLimit: 500,
      notificationToggle: false,
      status: false,
    },
  ]);

  // XP Conversion data
  const [xpConversions, setXpConversions] = useState([
    {
      id: 1,
      tier: "Bronze",
      tierColor: "#f68d2b",
      bgColor: "#ffefda",
      borderColor: "#c77023",
      conversionRatio: "200 XP = ₹1",
      enabled: true,
      redemptionChannels: ["Paytm", "UPI"],
    },
    {
      id: 2,
      tier: "Silver",
      tierColor: "#6f85a4",
      bgColor: "#f4f4f4", 
      borderColor: "#9aa7b8",
      conversionRatio: "150 XP = ₹1",
      enabled: true,
      redemptionChannels: ["Paytm", "UPI", "Gift Card"],
    },
    {
      id: 3,
      tier: "Gold",
      tierColor: "#c7a20f",
      bgColor: "#fffddf",
      borderColor: "#f0c92e",
      conversionRatio: "100 XP = ₹1",
      enabled: true,
      redemptionChannels: ["Paytm", "UPI", "Gift Card", "Bank Transfer"],
    },
  ]);

  // Bonus Logic data
  const [bonusLogic, setBonusLogic] = useState([
    {
      id: 1,
      bonusType: "Daily Login Streak",
      triggerCondition: "7 Days Login",
      rewardValue: "+500 XP",
      active: true,
    },
    {
      id: 2,
      bonusType: "Referral Bonus",
      triggerCondition: "Friend Sign Up & First Purchase",
      rewardValue: "+1000 XP + ₹50",
      active: true,
    },
    {
      id: 3,
      bonusType: "Achievement Unlock",
      triggerCondition: "Complete 10 Tasks",
      rewardValue: "+750 XP",
      active: false,
    },
    {
      id: 4,
      bonusType: "Weekly Challenge",
      triggerCondition: "Complete Weekly Goal",
      rewardValue: "+1500 XP",
      active: true,
    },
  ]);

  const paginationItems = [
    { type: "prev", label: "Prev", disabled: true },
    { type: "page", label: "1", active: true },
    { type: "page", label: "2", active: false },
    { type: "page", label: "3", active: false },
    { type: "ellipsis", label: "..." },
    { type: "page", label: "10", active: false },
    { type: "next", label: "Next", disabled: false },
  ];

  const handleTabClick = (tabName) => {
    setActiveTab(tabName);
  };

  const handlePageClick = (page) => {
    if (typeof page === "number") {
      setCurrentPage(page);
    }
  };


  // Universal CRUD operations
  const resetForm = () => {
    setFormData({
      // XP Tiers
      tierName: '',
      xpMin: '',
      xpMax: '',
      badge: null,
      accessBenefits: '',
      status: true,
      // XP Decay Settings
      decayRuleType: 'Fixed',
      inactivityDuration: '',
      minimumXpLimit: '',
      notificationToggle: true,
      // XP Conversion
      tier: '',
      conversionRatio: '',
      enabled: true,
      redemptionChannels: [],
      // Bonus Logic
      bonusType: '',
      triggerCondition: '',
      rewardValue: '',
      active: true
    });
    setFormErrors({});
  };

  const addToAuditLog = (action, tierName, details = '') => {
    const log = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      action,
      tierName,
      details,
      user: 'Admin User' // In real app, get from auth context
    };
    setAuditLogs(prev => [log, ...prev]);
  };

  const getTierColors = (tierName) => {
    const colorMap = {
      'Bronze': { color: '#f68d2b', bg: '#ffefda', border: '#c77023' },
      'Silver': { color: '#6f85a4', bg: '#f4f4f4', border: '#9aa7b8' },
      'Gold': { color: '#c7a20f', bg: '#fffddf', border: '#f0c92e' },
      'Platinum': { color: '#6a4c93', bg: '#f3f0ff', border: '#8b5cf6' },
      'Diamond': { color: '#059669', bg: '#d1fae5', border: '#10b981' }
    };
    return colorMap[tierName] || colorMap['Bronze'];
  };

  // Universal validation for all tabs
  const validateFormForTab = (tab) => {
    const errors = {};
    
    switch (tab) {
      case 'XP Tiers':
        // Tier Name validation (alphanumeric, required)
        if (!formData.tierName.trim()) {
          errors.tierName = 'Tier name is required';
        } else if (!/^[a-zA-Z0-9\s]+$/.test(formData.tierName)) {
          errors.tierName = 'Tier name must be alphanumeric';
        }
        
        // XP Range validation (numeric, required)
        if (!formData.xpMin) {
          errors.xpMin = 'Minimum XP is required';
        } else if (!/^\d+$/.test(formData.xpMin)) {
          errors.xpMin = 'Must be a valid number';
        }
        
        if (!formData.xpMax) {
          errors.xpMax = 'Maximum XP is required';
        } else if (!/^\d+$/.test(formData.xpMax)) {
          errors.xpMax = 'Must be a valid number';
        } else if (parseInt(formData.xpMax) <= parseInt(formData.xpMin)) {
          errors.xpMax = 'Maximum XP must be greater than minimum XP';
        }
        break;
        
      case 'XP Decay Settings':
        if (!formData.tierName.trim()) {
          errors.tierName = 'Tier name is required';
        }
        if (!formData.inactivityDuration) {
          errors.inactivityDuration = 'Inactivity duration is required';
        } else if (!/^\d+$/.test(formData.inactivityDuration)) {
          errors.inactivityDuration = 'Must be a valid number';
        }
        if (!formData.minimumXpLimit) {
          errors.minimumXpLimit = 'Minimum XP limit is required';
        } else if (!/^\d+$/.test(formData.minimumXpLimit)) {
          errors.minimumXpLimit = 'Must be a valid number';
        }
        break;
        
      case 'XP Conversion':
        if (!formData.tier) {
          errors.tier = 'Tier selection is required';
        }
        if (!formData.conversionRatio.trim()) {
          errors.conversionRatio = 'Conversion ratio is required';
        } else if (!/^\d+\s*XP\s*=\s*₹\d+$/.test(formData.conversionRatio)) {
          errors.conversionRatio = 'Format must be "150 XP = ₹1"';
        }
        if (formData.redemptionChannels.length === 0) {
          errors.redemptionChannels = 'At least one redemption channel is required';
        }
        break;
        
      case 'Bonus Logic':
        if (!formData.bonusType.trim()) {
          errors.bonusType = 'Bonus type is required';
        }
        if (!formData.triggerCondition.trim()) {
          errors.triggerCondition = 'Trigger condition is required';
        }
        if (!formData.rewardValue.trim()) {
          errors.rewardValue = 'Reward value is required';
        } else if (!/^[\+\-]?\d+\s*(XP|Coins|₹)/.test(formData.rewardValue)) {
          errors.rewardValue = 'Format must be "+500 XP" or "+1000 Coins" or "+₹50"';
        }
        break;
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Universal Add Handler
  const handleAdd = () => {
    if (!validateFormForTab(activeTab)) return;
    
    const newItem = { id: Date.now() };
    
    switch (activeTab) {
      case 'XP Tiers':
        const colors = getTierColors(formData.tierName);
        Object.assign(newItem, {
          tierName: formData.tierName,
          tierColor: colors.color,
          bgColor: colors.bg,
          borderColor: colors.border,
          iconSrc: formData.badge || "https://c.animaapp.com/mf180vyvQGfAhJ/img/---icon--star--9@2x.png",
          xpMin: parseInt(formData.xpMin),
          xpMax: parseInt(formData.xpMax),
          xpRange: `${formData.xpMin} - ${formData.xpMax} XP`,
          badge: formData.badge ? '📷' : '⭐',
          badgeFile: formData.badge,
          accessBenefits: formData.accessBenefits || 'Standard access',
          status: formData.status,
        });
        setXpTiers(prev => [...prev, newItem]);
        addToAuditLog('CREATE', formData.tierName, `Created new tier with XP range ${formData.xpMin}-${formData.xpMax}`);
        break;
        
      case 'XP Decay Settings':
        Object.assign(newItem, {
          tierName: formData.tierName,
          xpRange: `${formData.xpMin || 0} - ${formData.xpMax || 999} XP`,
          decayRuleType: formData.decayRuleType,
          inactivityDuration: `${formData.inactivityDuration} Days`,
          minimumXpLimit: parseInt(formData.minimumXpLimit),
          notificationToggle: formData.notificationToggle,
          status: formData.status,
        });
        setXpDecaySettings(prev => [...prev, newItem]);
        addToAuditLog('CREATE', formData.tierName, `Created decay rule: ${formData.decayRuleType} after ${formData.inactivityDuration} days`);
        break;
        
      case 'XP Conversion':
        const tierColors = getTierColors(formData.tier);
        Object.assign(newItem, {
          tier: formData.tier,
          tierColor: tierColors.color,
          bgColor: tierColors.bg,
          borderColor: tierColors.border,
          conversionRatio: formData.conversionRatio,
          enabled: formData.enabled,
          redemptionChannels: formData.redemptionChannels,
        });
        setXpConversions(prev => [...prev, newItem]);
        addToAuditLog('CREATE', formData.tier, `Created conversion rule: ${formData.conversionRatio}`);
        break;
        
      case 'Bonus Logic':
        // Enforce single active rule per bonus type
        if (formData.active) {
          setBonusLogic(prev => prev.map(bonus => 
            bonus.bonusType === formData.bonusType ? { ...bonus, active: false } : bonus
          ));
        }
        Object.assign(newItem, {
          bonusType: formData.bonusType,
          triggerCondition: formData.triggerCondition,
          rewardValue: formData.rewardValue,
          active: formData.active,
        });
        setBonusLogic(prev => [...prev, newItem]);
        addToAuditLog('CREATE', formData.bonusType, `Created bonus rule: ${formData.rewardValue} for ${formData.triggerCondition}`);
        break;
    }
    
    setShowAddModal(false);
    resetForm();
  };

  // Universal Edit Handler
  const handleEdit = () => {
    if (!validateFormForTab(activeTab)) return;
    
    switch (activeTab) {
      case 'XP Tiers':
        const colors = getTierColors(formData.tierName);
        const updatedTier = {
          ...editingItem,
          tierName: formData.tierName,
          tierColor: colors.color,
          bgColor: colors.bg,
          borderColor: colors.border,
          xpMin: parseInt(formData.xpMin),
          xpMax: parseInt(formData.xpMax),
          xpRange: `${formData.xpMin} - ${formData.xpMax} XP`,
          accessBenefits: formData.accessBenefits,
          status: formData.status,
          badge: formData.badge ? '📷' : editingItem.badge,
          badgeFile: formData.badge || editingItem.badgeFile,
          iconSrc: formData.badge || editingItem.iconSrc,
        };
        setXpTiers(prev => prev.map(tier => tier.id === editingItem.id ? updatedTier : tier));
        addToAuditLog('UPDATE', formData.tierName, `Updated tier details`);
        break;
        
      case 'XP Decay Settings':
        const updatedDecay = {
          ...editingItem,
          tierName: formData.tierName,
          xpRange: `${formData.xpMin || 0} - ${formData.xpMax || 999} XP`,
          decayRuleType: formData.decayRuleType,
          inactivityDuration: `${formData.inactivityDuration} Days`,
          minimumXpLimit: parseInt(formData.minimumXpLimit),
          notificationToggle: formData.notificationToggle,
          status: formData.status,
        };
        setXpDecaySettings(prev => prev.map(item => item.id === editingItem.id ? updatedDecay : item));
        addToAuditLog('UPDATE', formData.tierName, `Updated decay rule`);
        break;
        
      case 'XP Conversion':
        const tierColors = getTierColors(formData.tier);
        const updatedConversion = {
          ...editingItem,
          tier: formData.tier,
          tierColor: tierColors.color,
          bgColor: tierColors.bg,
          borderColor: tierColors.border,
          conversionRatio: formData.conversionRatio,
          enabled: formData.enabled,
          redemptionChannels: formData.redemptionChannels,
        };
        setXpConversions(prev => prev.map(item => item.id === editingItem.id ? updatedConversion : item));
        addToAuditLog('UPDATE', formData.tier, `Updated conversion rule`);
        break;
        
      case 'Bonus Logic':
        // Enforce single active rule per bonus type
        if (formData.active && formData.bonusType !== editingItem.bonusType) {
          setBonusLogic(prev => prev.map(bonus => 
            bonus.bonusType === formData.bonusType ? { ...bonus, active: false } : bonus
          ));
        }
        const updatedBonus = {
          ...editingItem,
          bonusType: formData.bonusType,
          triggerCondition: formData.triggerCondition,
          rewardValue: formData.rewardValue,
          active: formData.active,
        };
        setBonusLogic(prev => prev.map(item => item.id === editingItem.id ? updatedBonus : item));
        addToAuditLog('UPDATE', formData.bonusType, `Updated bonus rule`);
        break;
    }
    
    setShowEditModal(false);
    setEditingItem(null);
    resetForm();
  };

  // Universal Delete Handler
  const handleDelete = () => {
    const itemName = deletingItem.tierName || deletingItem.tier || deletingItem.bonusType || 'Item';
    
    switch (activeTab) {
      case 'XP Tiers':
        setXpTiers(prev => prev.filter(tier => tier.id !== deletingItem.id));
        break;
      case 'XP Decay Settings':
        setXpDecaySettings(prev => prev.filter(item => item.id !== deletingItem.id));
        break;
      case 'XP Conversion':
        setXpConversions(prev => prev.filter(item => item.id !== deletingItem.id));
        break;
      case 'Bonus Logic':
        setBonusLogic(prev => prev.filter(item => item.id !== deletingItem.id));
        break;
    }
    
    addToAuditLog('DELETE', itemName, `Deleted ${activeTab.toLowerCase()} item`);
    setShowDeleteConfirm(false);
    setDeletingItem(null);
  };

  // Universal Toggle Handlers
  const toggleStatus = (item) => {
    const itemName = item.tierName || item.tier || item.bonusType || 'Item';
    
    switch (activeTab) {
      case 'XP Tiers':
        const updatedTier = { ...item, status: !item.status };
        setXpTiers(prev => prev.map(t => t.id === item.id ? updatedTier : t));
        addToAuditLog('STATUS_CHANGE', itemName, `Status changed to ${updatedTier.status ? 'Active' : 'Inactive'}`);
        break;
        
      case 'XP Decay Settings':
        const updatedDecay = { ...item, status: !item.status };
        setXpDecaySettings(prev => prev.map(t => t.id === item.id ? updatedDecay : t));
        addToAuditLog('STATUS_CHANGE', itemName, `Decay rule ${updatedDecay.status ? 'activated' : 'deactivated'}`);
        break;
        
      case 'XP Conversion':
        const updatedConversion = { ...item, enabled: !item.enabled };
        setXpConversions(prev => prev.map(t => t.id === item.id ? updatedConversion : t));
        addToAuditLog('STATUS_CHANGE', itemName, `Conversion ${updatedConversion.enabled ? 'enabled' : 'disabled'}`);
        break;
        
      case 'Bonus Logic':
        // Enforce single active rule per bonus type
        if (!item.active) {
          setBonusLogic(prev => prev.map(bonus => 
            bonus.bonusType === item.bonusType && bonus.id !== item.id ? { ...bonus, active: false } : bonus
          ));
        }
        const updatedBonus = { ...item, active: !item.active };
        setBonusLogic(prev => prev.map(t => t.id === item.id ? updatedBonus : t));
        addToAuditLog('STATUS_CHANGE', itemName, `Bonus rule ${updatedBonus.active ? 'activated' : 'deactivated'}`);
        break;
    }
  };

  const toggleNotification = (item) => {
    const updatedItem = { ...item, notificationToggle: !item.notificationToggle };
    setXpDecaySettings(prev => prev.map(t => t.id === item.id ? updatedItem : t));
    addToAuditLog('NOTIFICATION_CHANGE', item.tierName, `Notification ${updatedItem.notificationToggle ? 'enabled' : 'disabled'}`);
  };

  // Universal Edit Modal Handler
  const openEditModal = (item) => {
    setEditingItem(item);
    
    switch (activeTab) {
      case 'XP Tiers':
        setFormData({
          tierName: item.tierName,
          xpMin: item.xpMin.toString(),
          xpMax: item.xpMax.toString(),
          badge: item.badgeFile,
          accessBenefits: item.accessBenefits,
          status: item.status
        });
        break;
        
      case 'XP Decay Settings':
        const duration = item.inactivityDuration.replace(' Days', '');
        setFormData({
          tierName: item.tierName,
          decayRuleType: item.decayRuleType,
          inactivityDuration: duration,
          minimumXpLimit: item.minimumXpLimit.toString(),
          notificationToggle: item.notificationToggle,
          status: item.status
        });
        break;
        
      case 'XP Conversion':
        setFormData({
          tier: item.tier,
          conversionRatio: item.conversionRatio,
          enabled: item.enabled,
          redemptionChannels: item.redemptionChannels
        });
        break;
        
      case 'Bonus Logic':
        setFormData({
          bonusType: item.bonusType,
          triggerCondition: item.triggerCondition,
          rewardValue: item.rewardValue,
          active: item.active
        });
        break;
    }
    
    setFormErrors({});
    setShowEditModal(true);
  };

  const openDeleteConfirm = (item) => {
    setDeletingItem(item);
    setShowDeleteConfirm(true);
  };

  // Export functionality
  const handleExport = () => {
    const data = getCurrentTabData();
    const exportData = {
      tab: activeTab,
      exportedAt: new Date().toISOString(),
      data: data,
      totalRecords: data.length
    };
    
    // Convert to CSV format
    let csvContent = '';
    if (data.length > 0) {
      // Get headers based on active tab
      const headers = getTableHeaders().map(h => h.label);
      csvContent = headers.join(',') + '\n';
      
      // Add data rows
      data.forEach(item => {
        let row = [];
        switch (activeTab) {
          case 'XP Tiers':
            row = [item.tierName, item.xpRange, item.badge, item.accessBenefits, item.status ? 'Active' : 'Inactive', 'Edit'];
            break;
          case 'XP Decay Settings':
            row = [item.tierName, item.xpRange, item.decayRuleType, item.inactivityDuration, item.minimumXpLimit + ' XP', item.notificationToggle ? 'Enabled' : 'Disabled', item.status ? 'Active' : 'Inactive', 'Edit'];
            break;
          case 'XP Conversion':
            row = [item.tier, item.conversionRatio, item.enabled ? 'Enabled' : 'Disabled', item.redemptionChannels.join('; '), 'Edit'];
            break;
          case 'Bonus Logic':
            row = [item.bonusType, item.triggerCondition, item.rewardValue, item.active ? 'Active' : 'Inactive', 'Edit'];
            break;
        }
        csvContent += row.map(field => `"${field}"`).join(',') + '\n';
      });
    }
    
    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${activeTab.replace(/\s+/g, '_')}_Export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    addToAuditLog('EXPORT', activeTab, `Exported ${data.length} ${activeTab.toLowerCase()} records`);
  };

  const handleFileUpload = (file) => {
    if (file && (file.type === 'image/svg+xml' || file.type === 'image/png' || file.type === 'image/jpeg')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({ ...prev, badge: e.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Helper functions for tab-specific data and rendering
  const getCurrentTabData = () => {
    switch (activeTab) {
      case "XP Tiers":
        return xpTiers;
      case "XP Decay Settings":
        return xpDecaySettings;
      case "XP Conversion":
        return xpConversions;
      case "Bonus Logic":
        return bonusLogic;
      default:
        return [];
    }
  };

  const getTableHeaders = () => {
    switch (activeTab) {
      case "XP Tiers":
        return [
          { label: "Tier Name", minWidth: "200px", align: "left" },
          { label: "XP Range", minWidth: "150px", align: "left" },
          { label: "Badge/Icon", minWidth: "120px", align: "center" },
          { label: "Access Benefits", minWidth: "180px", align: "center" },
          { label: "Status", minWidth: "100px", align: "center" },
          { label: "Action", minWidth: "100px", align: "center" },
        ];
      case "XP Decay Settings":
        return [
          { label: "Tier Name", minWidth: "150px", align: "left" },
          { label: "XP Range", minWidth: "130px", align: "left" },
          { label: "Decay Rule Type", minWidth: "140px", align: "center" },
          { label: "Inactivity Duration", minWidth: "150px", align: "center" },
          { label: "Min XP Limit", minWidth: "120px", align: "center" },
          { label: "Notification", minWidth: "120px", align: "center" },
          { label: "Status", minWidth: "100px", align: "center" },
          { label: "Action", minWidth: "100px", align: "center" },
        ];
      case "XP Conversion":
        return [
          { label: "XP Tier", minWidth: "150px", align: "left" },
          { label: "Conversion Ratio", minWidth: "150px", align: "center" },
          { label: "Enabled", minWidth: "100px", align: "center" },
          { label: "Redemption Channels", minWidth: "200px", align: "center" },
          { label: "Action", minWidth: "100px", align: "center" },
        ];
      case "Bonus Logic":
        return [
          { label: "Bonus Type", minWidth: "180px", align: "left" },
          { label: "Trigger Condition", minWidth: "200px", align: "center" },
          { label: "Reward Value", minWidth: "150px", align: "center" },
          { label: "Active", minWidth: "100px", align: "center" },
          { label: "Action", minWidth: "100px", align: "center" },
        ];
      default:
        return [];
    }
  };

  const getAddButtonText = () => {
    switch (activeTab) {
      case "XP Tiers":
        return "Add XP Tier";
      case "XP Decay Settings":
        return "Add Decay Rule";
      case "XP Conversion":
        return "Add Conversion Rule";
      case "Bonus Logic":
        return "Add Bonus Rule";
      default:
        return "Add Item";
    }
  };

  return (
    <div className="w-full">
      {/* Header with Filters */}
      <header className="flex flex-col lg:flex-row w-full items-start lg:items-end justify-between gap-6 mb-6" role="banner">
        <div className="flex-shrink-0">
          <h1 className="[font-family:'DM_Sans-SemiBold',Helvetica] font-semibold text-[#333333] text-[25.6px] tracking-[0] leading-[normal]">
            Rewards
          </h1>
          <p className="[font-family:'DM_Sans-Medium',Helvetica] font-medium text-[#666666] text-[14.4px] tracking-[0] leading-[normal] mt-1">
            Track all rewards and winners
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-end" role="toolbar" aria-label="Reward filters">
          {getFilterOptionsForTab(activeTab).map((filter) => (
            <div key={filter.id} className="relative min-w-[130px] flex-shrink-0">
              <div className="relative h-[42px] bg-white rounded-[9.6px] shadow-[0px_3.2px_3.2px_#0000000a] border border-gray-200">
                <select
                  id={`filter-${filter.id}`}
                  value={filter.value}
                  onChange={(e) => filter.onChange(e.target.value)}
                  className="w-full h-full px-3 pr-8 bg-transparent border-none rounded-[9.6px] cursor-pointer [font-family:'DM_Sans-Medium',Helvetica] font-medium text-[#3e4954] text-[13.5px] tracking-[0] leading-[normal] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                  aria-label={`Filter by ${filter.id}`}
                >
                  {filter.options.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                  <svg className="w-3 h-2 text-[#3e4954]" fill="currentColor" viewBox="0 0 12 7">
                    <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </div>
          ))}
          <button
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors h-[42px] whitespace-nowrap"
            onClick={() => setShowAddModal(true)}
            title={`Add new ${activeTab.toLowerCase()}`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            {getAddButtonText()}
          </button>
          <button
            onClick={handleExport}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors h-[42px] whitespace-nowrap"
            title="Export reward data"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            </svg>
            Export
          </button>
        </div>
      </header>

      {/* Tabs Section */}
      <div className="mb-6">
        <nav className="inline-flex items-start gap-4" role="tablist">
          {tabs.map((tab, index) => (
            <button
              key={index}
              className={`inline-flex items-center justify-center gap-2.5 px-3 py-1 relative flex-[0_0_auto] rounded transition-colors ${
                tab.name === activeTab
                  ? "bg-[#fff2ab]"
                  : "bg-[#ebebeb] hover:bg-[#e0e0e0]"
              }`}
              onClick={() => handleTabClick(tab.name)}
              role="tab"
              aria-selected={tab.name === activeTab}
            >
              <div
                className={`w-fit font-semibold tracking-[0] leading-6 whitespace-nowrap [font-family:'DM_Sans',Helvetica] text-sm ${
                  tab.name === activeTab ? "text-[#c88124]" : "text-[#757575]"
                }`}
              >
                {tab.name}
              </div>
            </button>
          ))}
        </nav>
      </div>

      {/* Dynamic Table Section */}
      <div className="bg-white rounded-[10px] border border-gray-200 w-full">
        <div className="overflow-x-auto">
          <table className="w-full" style={{ minWidth: '1000px' }}>
            <thead>
              <tr className="bg-[#ecf8f1]">
                {getTableHeaders().map((header, index) => (
                  <th 
                    key={index}
                    className={`py-4 px-4 font-semibold text-[#333333] text-sm tracking-[0.1px] ${
                      header.align === 'left' ? 'text-left' : 'text-center'
                    }`} 
                    style={{minWidth: header.minWidth}}
                  >
                    {header.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {getCurrentTabData().map((row, index) => (
                <tr key={row.id} className="border-b border-[#d0d6e7] hover:bg-gray-50">
                  {activeTab === "XP Tiers" && (
                    <>
                      <td className="py-4 px-4">
                        <div
                          className="inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full border border-solid"
                          style={{
                            backgroundColor: row.bgColor,
                            borderColor: row.borderColor,
                          }}
                        >
                          <img
                            className="w-4 h-4"
                            alt={`${row.tierName} tier icon`}
                            src={row.badgeFile || row.iconSrc}
                          />
                          <div
                            className="[font-family:'DM_Sans',Helvetica] font-semibold text-sm text-center tracking-[0.10px] leading-5 whitespace-nowrap"
                            style={{ color: row.tierColor }}
                          >
                            {row.tierName}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-normal text-[#7f7f7f] [font-family:'DM_Sans',Helvetica] text-sm tracking-[0.10px]">
                          {row.xpRange}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div className="font-normal text-[#7f7f7f] [font-family:'DM_Sans',Helvetica] text-sm tracking-[0.10px]">
                          {row.badge}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div className="font-normal text-[#333333] [font-family:'DM_Sans',Helvetica] text-sm tracking-[0.10px]">
                          {row.accessBenefits}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <button
                          onClick={() => toggleStatus(row)}
                          className={`inline-flex h-[30px] items-center justify-center gap-2.5 px-3 py-1 rounded-[20px] overflow-hidden transition-colors cursor-pointer hover:opacity-80 ${
                            row.status ? 'bg-[#d4f8d3]' : 'bg-[#fde2e2]'
                          }`}
                          title={`Toggle status (currently ${row.status ? 'Active' : 'Inactive'})`}
                        >
                          <div className={`font-normal [font-family:'DM_Sans',Helvetica] text-sm whitespace-nowrap ${
                            row.status ? 'text-[#076758]' : 'text-[#dc2626]'
                          }`}>
                            {row.status ? 'Active' : 'Inactive'}
                          </div>
                        </button>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openEditModal(row)}
                            className="hover:opacity-70 transition-opacity p-1"
                            aria-label={`Edit ${row.tierName} tier`}
                            title="Edit tier"
                          >
                            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => openDeleteConfirm(row)}
                            className="hover:opacity-70 transition-opacity p-1"
                            aria-label={`Delete ${row.tierName} tier`}
                            title="Delete tier"
                          >
                            <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                  {activeTab === "XP Decay Settings" && (
                    <>
                      <td className="py-4 px-4">
                        <div className="font-semibold text-[#333333] [font-family:'DM_Sans',Helvetica] text-sm tracking-[0.10px]">
                          {row.tierName}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-normal text-[#7f7f7f] [font-family:'DM_Sans',Helvetica] text-sm tracking-[0.10px]">
                          {row.xpRange}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div className={`inline-flex h-[30px] items-center justify-center gap-2.5 px-3 py-1 rounded-[20px] overflow-hidden ${
                          row.decayRuleType === 'Fixed' ? 'bg-[#e3f2fd]' : 'bg-[#f3e5f5]'
                        }`}>
                          <div className={`font-normal [font-family:'DM_Sans',Helvetica] text-sm whitespace-nowrap ${
                            row.decayRuleType === 'Fixed' ? 'text-[#1976d2]' : 'text-[#7b1fa2]'
                          }`}>
                            {row.decayRuleType}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div className="font-normal text-[#333333] [font-family:'DM_Sans',Helvetica] text-sm tracking-[0.10px]">
                          {row.inactivityDuration}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div className="font-normal text-[#333333] [font-family:'DM_Sans',Helvetica] text-sm tracking-[0.10px]">
                          {row.minimumXpLimit} XP
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <button
                          onClick={() => toggleNotification(row)}
                          className={`inline-flex h-[30px] items-center justify-center gap-2.5 px-3 py-1 rounded-[20px] overflow-hidden transition-colors cursor-pointer hover:opacity-80 ${
                            row.notificationToggle ? 'bg-[#d4f8d3]' : 'bg-[#fde2e2]'
                          }`}
                        >
                          <div className={`font-normal [font-family:'DM_Sans',Helvetica] text-sm whitespace-nowrap ${
                            row.notificationToggle ? 'text-[#076758]' : 'text-[#dc2626]'
                          }`}>
                            {row.notificationToggle ? 'Enabled' : 'Disabled'}
                          </div>
                        </button>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <button
                          onClick={() => toggleStatus(row)}
                          className={`inline-flex h-[30px] items-center justify-center gap-2.5 px-3 py-1 rounded-[20px] overflow-hidden transition-colors cursor-pointer hover:opacity-80 ${
                            row.status ? 'bg-[#d4f8d3]' : 'bg-[#fde2e2]'
                          }`}
                        >
                          <div className={`font-normal [font-family:'DM_Sans',Helvetica] text-sm whitespace-nowrap ${
                            row.status ? 'text-[#076758]' : 'text-[#dc2626]'
                          }`}>
                            {row.status ? 'Active' : 'Inactive'}
                          </div>
                        </button>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <button
                          onClick={() => openEditModal(row)}
                          className="hover:opacity-70 transition-opacity p-1"
                          title="Edit decay rule"
                        >
                          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                      </td>
                    </>
                  )}
                  {activeTab === "XP Conversion" && (
                    <>
                      <td className="py-4 px-4">
                        <div
                          className="inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full border border-solid"
                          style={{
                            backgroundColor: row.bgColor,
                            borderColor: row.borderColor,
                          }}
                        >
                          <div
                            className="[font-family:'DM_Sans',Helvetica] font-semibold text-sm text-center tracking-[0.10px] leading-5 whitespace-nowrap"
                            style={{ color: row.tierColor }}
                          >
                            {row.tier}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div className="font-semibold text-[#333333] [font-family:'DM_Sans',Helvetica] text-sm tracking-[0.10px]">
                          {row.conversionRatio}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <button
                          onClick={() => toggleStatus(row)}
                          className={`inline-flex h-[30px] items-center justify-center gap-2.5 px-3 py-1 rounded-[20px] overflow-hidden transition-colors cursor-pointer hover:opacity-80 ${
                            row.enabled ? 'bg-[#d4f8d3]' : 'bg-[#fde2e2]'
                          }`}
                        >
                          <div className={`font-normal [font-family:'DM_Sans',Helvetica] text-sm whitespace-nowrap ${
                            row.enabled ? 'text-[#076758]' : 'text-[#dc2626]'
                          }`}>
                            {row.enabled ? 'Enabled' : 'Disabled'}
                          </div>
                        </button>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div className="flex flex-wrap gap-1 justify-center">
                          {row.redemptionChannels.map((channel, idx) => (
                            <div
                              key={idx}
                              className="inline-flex items-center justify-center px-2 py-1 bg-[#f0f9ff] text-[#0369a1] rounded-md text-xs font-medium"
                            >
                              {channel}
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <button
                          onClick={() => openEditModal(row)}
                          className="hover:opacity-70 transition-opacity p-1"
                          title="Edit conversion rule"
                        >
                          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                      </td>
                    </>
                  )}
                  {activeTab === "Bonus Logic" && (
                    <>
                      <td className="py-4 px-4">
                        <div className="font-semibold text-[#333333] [font-family:'DM_Sans',Helvetica] text-sm tracking-[0.10px]">
                          {row.bonusType}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div className="font-normal text-[#7f7f7f] [font-family:'DM_Sans',Helvetica] text-sm tracking-[0.10px]">
                          {row.triggerCondition}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div className="font-semibold text-[#333333] [font-family:'DM_Sans',Helvetica] text-sm tracking-[0.10px]">
                          {row.rewardValue}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <button
                          onClick={() => toggleStatus(row)}
                          className={`inline-flex h-[30px] items-center justify-center gap-2.5 px-3 py-1 rounded-[20px] overflow-hidden transition-colors cursor-pointer hover:opacity-80 ${
                            row.active ? 'bg-[#d4f8d3]' : 'bg-[#fde2e2]'
                          }`}
                        >
                          <div className={`font-normal [font-family:'DM_Sans',Helvetica] text-sm whitespace-nowrap ${
                            row.active ? 'text-[#076758]' : 'text-[#dc2626]'
                          }`}>
                            {row.active ? 'Active' : 'Inactive'}
                          </div>
                        </button>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openEditModal(row)}
                            className="hover:opacity-70 transition-opacity p-1"
                            title="Edit bonus rule"
                          >
                            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => openDeleteConfirm(row)}
                            className="hover:opacity-70 transition-opacity p-1 text-red-600"
                            title="Delete bonus rule"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex justify-center mt-6">
        <nav
          className="inline-flex items-start gap-[5.32px] relative flex-[0_0_auto]"
          aria-label="Table pagination"
        >
          {paginationItems.map((item, index) => {
            if (item.type === "prev" || item.type === "next") {
              return (
                <button
                  key={index}
                  className={`inline-flex flex-col h-[34.07px] items-center justify-center gap-[10.65px] px-[4.26px] py-[10.65px] relative flex-[0_0_auto] bg-white rounded-[8.52px] transition-colors ${
                    item.disabled
                      ? "cursor-not-allowed"
                      : "hover:bg-gray-50 cursor-pointer"
                  }`}
                  disabled={item.disabled}
                  onClick={() =>
                    !item.disabled &&
                    handlePageClick(
                      item.type === "prev" ? currentPage - 1 : currentPage + 1,
                    )
                  }
                  aria-label={item.label}
                >
                  <div
                    className={`relative w-fit mt-[-4.18px] mb-[-2.05px] [font-family:'Open_Sans',Helvetica] font-semibold text-[13.8px] tracking-[0] leading-[normal] ${
                      item.disabled ? "text-[#cccccc]" : "text-[#333333]"
                    }`}
                  >
                    {item.label}
                  </div>
                </button>
              );
            }

            if (item.type === "ellipsis") {
              return (
                <div
                  key={index}
                  className="bg-white flex flex-col w-[34.07px] h-[34.07px] items-center justify-center gap-[10.65px] p-[10.65px] relative rounded-[8.52px]"
                >
                  <div className="relative w-fit mt-[-4.18px] mb-[-2.05px] [font-family:'Open_Sans',Helvetica] font-semibold text-[#333333] text-[13.8px] tracking-[0] leading-[normal]">
                    {item.label}
                  </div>
                </div>
              );
            }

            if (item.type === "page") {
              const pageNumber = Number.parseInt(item.label);
              const isActive = item.active;

              return (
                <button
                  key={index}
                  className={`flex flex-col w-[34.07px] h-[34.07px] items-center justify-center gap-[10.65px] p-[10.65px] relative rounded-[8.52px] transition-colors ${
                    isActive
                      ? "bg-[#d0fee4]"
                      : "bg-white border-[1.06px] border-solid border-[#f1f1f1] hover:bg-gray-50"
                  } ${pageNumber === 10 ? "ml-[-1.61px] mr-[-1.61px]" : ""}`}
                  onClick={() => handlePageClick(pageNumber)}
                  aria-label={`Go to page ${pageNumber}`}
                  aria-current={isActive ? "page" : undefined}
                >
                  <div className="relative w-fit mt-[-4.18px] mb-[-2.05px] [font-family:'Open_Sans',Helvetica] font-semibold text-[#333333] text-[13.8px] tracking-[0] leading-[normal]">
                    {item.label}
                  </div>
                </button>
              );
            }

            return null;
          })}
        </nav>
      </div>

      {/* Universal Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">Add New {activeTab.slice(0, -1)}</h2>
            
            {/* Dynamic Form Content */}
            <div className="space-y-4">
              {activeTab === 'XP Tiers' && (
                <>
                  {/* Tier Name */}
                  <div>
                    <label className="block text-sm font-medium text-black mb-1">
                      Tier Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.tierName}
                      onChange={(e) => setFormData(prev => ({ ...prev, tierName: e.target.value }))}
                      placeholder="Bronze"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                    />
                    {formErrors.tierName && <p className="text-red-500 text-xs mt-1">{formErrors.tierName}</p>}
                  </div>

                  {/* XP Range */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-black mb-1">
                        Min XP <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        value={formData.xpMin}
                        onChange={(e) => setFormData(prev => ({ ...prev, xpMin: e.target.value }))}
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
                        onChange={(e) => setFormData(prev => ({ ...prev, xpMax: e.target.value }))}
                        placeholder="999"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                      />
                      {formErrors.xpMax && <p className="text-red-500 text-xs mt-1">{formErrors.xpMax}</p>}
                    </div>
                  </div>
                  {formErrors.xpRange && <p className="text-red-500 text-xs mt-1">{formErrors.xpRange}</p>}

                  {/* Badge Upload */}
                  <div>
                    <label className="block text-sm font-medium text-black mb-1">
                      Badge/Icon
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="file"
                        accept="image/svg+xml,image/png,image/jpeg"
                        onChange={(e) => handleFileUpload(e.target.files[0])}
                        className="hidden"
                        id="badge-upload"
                      />
                      <label
                        htmlFor="badge-upload"
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg cursor-pointer transition-colors"
                      >
                        Upload
                      </label>
                      {formData.badge && (
                        <div className="flex items-center gap-2">
                          <img src={formData.badge} alt="Badge preview" className="w-8 h-8 object-cover rounded" />
                          <button
                            onClick={() => setFormData(prev => ({ ...prev, badge: null }))}
                            className="text-red-500 hover:text-red-700"
                          >
                            Remove
                          </button>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-800 mt-1">Supported: SVG, PNG, JPG</p>
                  </div>

                  {/* Access Benefits */}
                  <div>
                    <label className="block text-sm font-medium text-black mb-1">
                      Access Benefits
                    </label>
                    <textarea
                      value={formData.accessBenefits}
                      onChange={(e) => setFormData(prev => ({ ...prev, accessBenefits: e.target.value }))}
                      placeholder="Entry-level access"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                    />
                  </div>

                  {/* Status */}
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="status"
                      checked={formData.status}
                      onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.checked }))}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="status" className="text-sm font-medium text-black">
                      Active
                    </label>
                  </div>
                </>
              )}

              {activeTab === 'XP Decay Settings' && (
                <>
                  {/* Tier Name */}
                  <div>
                    <label className="block text-sm font-medium text-black mb-1">
                      Tier Name <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.tierName}
                      onChange={(e) => setFormData(prev => ({ ...prev, tierName: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                    >
                      <option value="">Select Tier</option>
                      <option value="Bronze">Bronze</option>
                      <option value="Silver">Silver</option>
                      <option value="Gold">Gold</option>
                      <option value="Platinum">Platinum</option>
                      <option value="Diamond">Diamond</option>
                    </select>
                    {formErrors.tierName && <p className="text-red-500 text-xs mt-1">{formErrors.tierName}</p>}
                  </div>

                  {/* Decay Rule Type */}
                  <div>
                    <label className="block text-sm font-medium text-black mb-1">
                      Decay Rule Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.decayRuleType}
                      onChange={(e) => setFormData(prev => ({ ...prev, decayRuleType: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                    >
                      <option value="Fixed">Fixed</option>
                      <option value="Stepwise">Stepwise</option>
                    </select>
                  </div>

                  {/* Inactivity Duration */}
                  <div>
                    <label className="block text-sm font-medium text-black mb-1">
                      Inactivity Duration (Days) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.inactivityDuration}
                      onChange={(e) => setFormData(prev => ({ ...prev, inactivityDuration: e.target.value }))}
                      placeholder="7"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                    />
                    {formErrors.inactivityDuration && <p className="text-red-500 text-xs mt-1">{formErrors.inactivityDuration}</p>}
                  </div>

                  {/* Minimum XP Limit */}
                  <div>
                    <label className="block text-sm font-medium text-black mb-1">
                      Minimum XP Limit <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.minimumXpLimit}
                      onChange={(e) => setFormData(prev => ({ ...prev, minimumXpLimit: e.target.value }))}
                      placeholder="100"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                    />
                    {formErrors.minimumXpLimit && <p className="text-red-500 text-xs mt-1">{formErrors.minimumXpLimit}</p>}
                  </div>

                  {/* Notification Toggle */}
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="notificationToggle"
                      checked={formData.notificationToggle}
                      onChange={(e) => setFormData(prev => ({ ...prev, notificationToggle: e.target.checked }))}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="notificationToggle" className="text-sm font-medium text-black">
                      Send notification before decay
                    </label>
                  </div>

                  {/* Status */}
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="status-decay"
                      checked={formData.status}
                      onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.checked }))}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="status-decay" className="text-sm font-medium text-black">
                      Active
                    </label>
                  </div>
                </>
              )}

              {activeTab === 'XP Conversion' && (
                <>
                  {/* Tier */}
                  <div>
                    <label className="block text-sm font-medium text-black mb-1">
                      XP Tier <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.tier}
                      onChange={(e) => setFormData(prev => ({ ...prev, tier: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                    >
                      <option value="">Select Tier</option>
                      <option value="Bronze">Bronze</option>
                      <option value="Silver">Silver</option>
                      <option value="Gold">Gold</option>
                      <option value="Platinum">Platinum</option>
                    </select>
                    {formErrors.tier && <p className="text-red-500 text-xs mt-1">{formErrors.tier}</p>}
                  </div>

                  {/* Conversion Ratio */}
                  <div>
                    <label className="block text-sm font-medium text-black mb-1">
                      Conversion Ratio <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.conversionRatio}
                      onChange={(e) => setFormData(prev => ({ ...prev, conversionRatio: e.target.value }))}
                      placeholder="150 XP = ₹1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                    />
                    {formErrors.conversionRatio && <p className="text-red-500 text-xs mt-1">{formErrors.conversionRatio}</p>}
                  </div>

                  {/* Redemption Channels */}
                  <div>
                    <label className="block text-sm font-medium text-black mb-1">
                      Redemption Channels <span className="text-red-500">*</span>
                    </label>
                    <div className="space-y-2">
                      {['Paytm', 'UPI', 'Gift Card', 'Bank Transfer'].map(channel => (
                        <label key={channel} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={formData.redemptionChannels.includes(channel)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData(prev => ({ ...prev, redemptionChannels: [...prev.redemptionChannels, channel] }));
                              } else {
                                setFormData(prev => ({ ...prev, redemptionChannels: prev.redemptionChannels.filter(c => c !== channel) }));
                              }
                            }}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm font-medium text-black">{channel}</span>
                        </label>
                      ))}
                    </div>
                    {formErrors.redemptionChannels && <p className="text-red-500 text-xs mt-1">{formErrors.redemptionChannels}</p>}
                  </div>

                  {/* Enabled */}
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="enabled"
                      checked={formData.enabled}
                      onChange={(e) => setFormData(prev => ({ ...prev, enabled: e.target.checked }))}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="enabled" className="text-sm font-medium text-black">
                      Enabled
                    </label>
                  </div>
                </>
              )}

              {activeTab === 'Bonus Logic' && (
                <>
                  {/* Bonus Type */}
                  <div>
                    <label className="block text-sm font-medium text-black mb-1">
                      Bonus Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.bonusType}
                      onChange={(e) => setFormData(prev => ({ ...prev, bonusType: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                    >
                      <option value="">Select Bonus Type</option>
                      <option value="Daily Login Streak">Daily Login Streak</option>
                      <option value="Referral Bonus">Referral Bonus</option>
                      <option value="Achievement Unlock">Achievement Unlock</option>
                      <option value="Weekly Challenge">Weekly Challenge</option>
                      <option value="Monthly Milestone">Monthly Milestone</option>
                    </select>
                    {formErrors.bonusType && <p className="text-red-500 text-xs mt-1">{formErrors.bonusType}</p>}
                  </div>

                  {/* Trigger Condition */}
                  <div>
                    <label className="block text-sm font-medium text-black mb-1">
                      Trigger Condition <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={formData.triggerCondition}
                      onChange={(e) => setFormData(prev => ({ ...prev, triggerCondition: e.target.value }))}
                      placeholder="7 Days Login"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                    />
                    {formErrors.triggerCondition && <p className="text-red-500 text-xs mt-1">{formErrors.triggerCondition}</p>}
                  </div>

                  {/* Reward Value */}
                  <div>
                    <label className="block text-sm font-medium text-black mb-1">
                      Reward Value <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.rewardValue}
                      onChange={(e) => setFormData(prev => ({ ...prev, rewardValue: e.target.value }))}
                      placeholder="+500 XP or +1000 Coins or +₹50"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                    />
                    {formErrors.rewardValue && <p className="text-red-500 text-xs mt-1">{formErrors.rewardValue}</p>}
                  </div>

                  {/* Active */}
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="active"
                      checked={formData.active}
                      onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.checked }))}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="active" className="text-sm font-medium text-black">
                      Active
                    </label>
                  </div>
                </>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
                className="px-4 py-2 text-black border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAdd}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {getAddButtonText()}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Universal Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">Edit {activeTab.slice(0, -1)}</h2>
            
            {/* Dynamic Edit Form - Same structure as Add Modal */}
            <div className="space-y-4">
              {activeTab === 'XP Tiers' && (
                <>
                  {/* Tier Name */}
                  <div>
                    <label className="block text-sm font-medium text-black mb-1">
                      Tier Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.tierName}
                      onChange={(e) => setFormData(prev => ({ ...prev, tierName: e.target.value }))}
                      placeholder="Bronze"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                    />
                    {formErrors.tierName && <p className="text-red-500 text-xs mt-1">{formErrors.tierName}</p>}
                  </div>

                  {/* XP Range */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-black mb-1">
                        Min XP <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        value={formData.xpMin}
                        onChange={(e) => setFormData(prev => ({ ...prev, xpMin: e.target.value }))}
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
                        onChange={(e) => setFormData(prev => ({ ...prev, xpMax: e.target.value }))}
                        placeholder="999"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                      />
                      {formErrors.xpMax && <p className="text-red-500 text-xs mt-1">{formErrors.xpMax}</p>}
                    </div>
                  </div>
                  {formErrors.xpRange && <p className="text-red-500 text-xs mt-1">{formErrors.xpRange}</p>}

                  {/* Badge Upload */}
                  <div>
                    <label className="block text-sm font-medium text-black mb-1">
                      Badge/Icon
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="file"
                        accept="image/svg+xml,image/png,image/jpeg"
                        onChange={(e) => handleFileUpload(e.target.files[0])}
                        className="hidden"
                        id="badge-upload-edit"
                      />
                      <label
                        htmlFor="badge-upload-edit"
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg cursor-pointer transition-colors"
                      >
                        Upload New
                      </label>
                      {formData.badge && (
                        <div className="flex items-center gap-2">
                          <img src={formData.badge} alt="Badge preview" className="w-8 h-8 object-cover rounded" />
                          <button
                            onClick={() => setFormData(prev => ({ ...prev, badge: null }))}
                            className="text-red-500 hover:text-red-700"
                          >
                            Remove
                          </button>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-800 mt-1">Supported: SVG, PNG, JPG</p>
                  </div>

                  {/* Access Benefits */}
                  <div>
                    <label className="block text-sm font-medium text-black mb-1">
                      Access Benefits
                    </label>
                    <textarea
                      value={formData.accessBenefits}
                      onChange={(e) => setFormData(prev => ({ ...prev, accessBenefits: e.target.value }))}
                      placeholder="Entry-level access"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                    />
                  </div>

                  {/* Status */}
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="status-edit"
                      checked={formData.status}
                      onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.checked }))}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="status-edit" className="text-sm font-medium text-black">
                      Active
                    </label>
                  </div>
                </>
              )}

              {activeTab === 'XP Decay Settings' && (
                <>
                  {/* Same fields as Add modal for consistency */}
                  <div>
                    <label className="block text-sm font-medium text-black mb-1">
                      Tier Name <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.tierName}
                      onChange={(e) => setFormData(prev => ({ ...prev, tierName: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                    >
                      <option value="">Select Tier</option>
                      <option value="Bronze">Bronze</option>
                      <option value="Silver">Silver</option>
                      <option value="Gold">Gold</option>
                      <option value="Platinum">Platinum</option>
                      <option value="Diamond">Diamond</option>
                    </select>
                    {formErrors.tierName && <p className="text-red-500 text-xs mt-1">{formErrors.tierName}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black mb-1">
                      Decay Rule Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.decayRuleType}
                      onChange={(e) => setFormData(prev => ({ ...prev, decayRuleType: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                    >
                      <option value="Fixed">Fixed</option>
                      <option value="Stepwise">Stepwise</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black mb-1">
                      Inactivity Duration (Days) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.inactivityDuration}
                      onChange={(e) => setFormData(prev => ({ ...prev, inactivityDuration: e.target.value }))}
                      placeholder="7"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                    />
                    {formErrors.inactivityDuration && <p className="text-red-500 text-xs mt-1">{formErrors.inactivityDuration}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black mb-1">
                      Minimum XP Limit <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.minimumXpLimit}
                      onChange={(e) => setFormData(prev => ({ ...prev, minimumXpLimit: e.target.value }))}
                      placeholder="100"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                    />
                    {formErrors.minimumXpLimit && <p className="text-red-500 text-xs mt-1">{formErrors.minimumXpLimit}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="notificationToggle-edit"
                      checked={formData.notificationToggle}
                      onChange={(e) => setFormData(prev => ({ ...prev, notificationToggle: e.target.checked }))}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="notificationToggle-edit" className="text-sm font-medium text-black">
                      Send notification before decay
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="status-decay-edit"
                      checked={formData.status}
                      onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.checked }))}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="status-decay-edit" className="text-sm font-medium text-black">
                      Active
                    </label>
                  </div>
                </>
              )}

              {activeTab === 'XP Conversion' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-black mb-1">
                      XP Tier <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.tier}
                      onChange={(e) => setFormData(prev => ({ ...prev, tier: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                    >
                      <option value="">Select Tier</option>
                      <option value="Bronze">Bronze</option>
                      <option value="Silver">Silver</option>
                      <option value="Gold">Gold</option>
                      <option value="Platinum">Platinum</option>
                    </select>
                    {formErrors.tier && <p className="text-red-500 text-xs mt-1">{formErrors.tier}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black mb-1">
                      Conversion Ratio <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.conversionRatio}
                      onChange={(e) => setFormData(prev => ({ ...prev, conversionRatio: e.target.value }))}
                      placeholder="150 XP = ₹1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                    />
                    {formErrors.conversionRatio && <p className="text-red-500 text-xs mt-1">{formErrors.conversionRatio}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black mb-1">
                      Redemption Channels <span className="text-red-500">*</span>
                    </label>
                    <div className="space-y-2">
                      {['Paytm', 'UPI', 'Gift Card', 'Bank Transfer'].map(channel => (
                        <label key={channel} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={formData.redemptionChannels.includes(channel)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData(prev => ({ ...prev, redemptionChannels: [...prev.redemptionChannels, channel] }));
                              } else {
                                setFormData(prev => ({ ...prev, redemptionChannels: prev.redemptionChannels.filter(c => c !== channel) }));
                              }
                            }}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm font-medium text-black">{channel}</span>
                        </label>
                      ))}
                    </div>
                    {formErrors.redemptionChannels && <p className="text-red-500 text-xs mt-1">{formErrors.redemptionChannels}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="enabled-edit"
                      checked={formData.enabled}
                      onChange={(e) => setFormData(prev => ({ ...prev, enabled: e.target.checked }))}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="enabled-edit" className="text-sm font-medium text-black">
                      Enabled
                    </label>
                  </div>
                </>
              )}

              {activeTab === 'Bonus Logic' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-black mb-1">
                      Bonus Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.bonusType}
                      onChange={(e) => setFormData(prev => ({ ...prev, bonusType: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                    >
                      <option value="">Select Bonus Type</option>
                      <option value="Daily Login Streak">Daily Login Streak</option>
                      <option value="Referral Bonus">Referral Bonus</option>
                      <option value="Achievement Unlock">Achievement Unlock</option>
                      <option value="Weekly Challenge">Weekly Challenge</option>
                      <option value="Monthly Milestone">Monthly Milestone</option>
                    </select>
                    {formErrors.bonusType && <p className="text-red-500 text-xs mt-1">{formErrors.bonusType}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black mb-1">
                      Trigger Condition <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={formData.triggerCondition}
                      onChange={(e) => setFormData(prev => ({ ...prev, triggerCondition: e.target.value }))}
                      placeholder="7 Days Login"
                      rows={3}
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
                      placeholder="+500 XP or +1000 Coins or +₹50"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                    />
                    {formErrors.rewardValue && <p className="text-red-500 text-xs mt-1">{formErrors.rewardValue}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="active-edit"
                      checked={formData.active}
                      onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.checked }))}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="active-edit" className="text-sm font-medium text-black">
                      Active
                    </label>
                  </div>
                </>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingItem(null);
                  resetForm();
                }}
                className="px-4 py-2 text-black border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleEdit}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Universal Delete Confirmation Modal */}
      {showDeleteConfirm && deletingItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-semibold mb-4 text-red-600">Delete {activeTab.slice(0, -1)}</h2>
            <p className="text-black mb-6">
              Are you sure you want to delete the <strong>{deletingItem.tierName || deletingItem.tier || deletingItem.bonusType || 'selected item'}</strong>? 
              This action cannot be undone and may affect users or system functionality.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeletingItem(null);
                }}
                className="px-4 py-2 text-black border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete Tier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}