import React, { useState } from "react";
import StatCard from "./StatCard";
import "./Achievements.css";

// Icon mapping
const iconMap = {
  trophy: '🏆',
  star: '⭐',
  medal: '🥇',
  certificate: '📜',
  crown: '👑',
  badge: '🎖️',
  flag: '🚩',
  rocket: '🚀',
  target: '🎯',
  fire: '🔥',
  lightning: '⚡',
  heart: '❤️',
  book: '📚',
  graduation: '🎓',
  award: '🏅'
};

const rarityColors = {
  common: '#6b7280',
  rare: '#3b82f6',
  epic: '#a855f7',
  legendary: '#eab308'
};

const rarityGradients = {
  common: 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)',
  rare: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
  epic: 'linear-gradient(135deg, #c084fc 0%, #a855f7 100%)',
  legendary: 'linear-gradient(135deg, #fbbf24 0%, #eab308 100%)'
};

// Modal Component
function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal-header">
          <h3 className="admin-modal-title">{title}</h3>
          <button onClick={onClose} className="admin-modal-close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div className="admin-modal-body">
          {children}
        </div>
      </div>
    </div>
  );
}

function Achievements({ 
  achievements, 
  onCreateAchievement, 
  onUpdateAchievement, 
  onDeleteAchievement,
  onToggleStatus,
  onBulkImport
}) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [bulkImportModalOpen, setBulkImportModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  
  // Form states
  const [currentAchievement, setCurrentAchievement] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: 'trophy',
    category: 'learning',
    points: 10,
    requirement: {
      type: 'courses_completed',
      threshold: 1
    },
    rarity: 'common'
  });
  
  const [bulkData, setBulkData] = useState('');
  const [bulkError, setBulkError] = useState('');

  // Filter achievements
  const filteredAchievements = achievements.filter(achievement => {
    const matchesCategory = selectedCategory === 'all' || achievement.category === selectedCategory;
    const matchesSearch = achievement.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         achievement.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Group by category
  const achievementsByCategory = filteredAchievements.reduce((acc, achievement) => {
    if (!acc[achievement.category]) {
      acc[achievement.category] = [];
    }
    acc[achievement.category].push(achievement);
    return acc;
  }, {});

  const handleCreateClick = () => {
    setFormData({
      name: '',
      description: '',
      icon: 'trophy',
      category: 'learning',
      points: 10,
      requirement: {
        type: 'courses_completed',
        threshold: 1
      },
      rarity: 'common'
    });
    setCreateModalOpen(true);
  };

  const handleEditClick = (achievement) => {
    setCurrentAchievement(achievement);
    setFormData({
      name: achievement.name,
      description: achievement.description,
      icon: achievement.icon,
      category: achievement.category,
      points: achievement.points,
      requirement: {
        type: achievement.requirement.type,
        threshold: achievement.requirement.threshold
      },
      rarity: achievement.rarity
    });
    setEditModalOpen(true);
  };

  const handleDeleteClick = (achievement) => {
    setCurrentAchievement(achievement);
    setDeleteModalOpen(true);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    await onCreateAchievement(formData);
    setCreateModalOpen(false);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    await onUpdateAchievement(currentAchievement._id || currentAchievement.id, formData);
    setEditModalOpen(false);
  };

  const handleDeleteConfirm = async () => {
    await onDeleteAchievement(currentAchievement._id || currentAchievement.id);
    setDeleteModalOpen(false);
  };

  const handleBulkImportSubmit = async (e) => {
    e.preventDefault();
    setBulkError('');
    
    try {
      const parsed = JSON.parse(bulkData);
      if (!Array.isArray(parsed)) {
        setBulkError('Data must be an array of achievements');
        return;
      }
      
      const result = await onBulkImport(parsed);
      if (result.success) {
        setBulkImportModalOpen(false);
        setBulkData('');
      } else {
        setBulkError(result.error || 'Failed to import achievements');
      }
    } catch (error) {
      setBulkError('Invalid JSON format');
    }
  };

  const categories = [
    { value: 'all', label: 'All Categories', icon: '📋' },
    { value: 'learning', label: 'Learning', icon: '📚' },
    { value: 'progress', label: 'Progress', icon: '📈' },
    { value: 'social', label: 'Social', icon: '👥' },
    { value: 'special', label: 'Special', icon: '✨' },
    { value: 'milestone', label: 'Milestone', icon: '🎯' }
  ];

  const requirementTypes = [
    { value: 'courses_completed', label: 'Courses Completed' },
    { value: 'quizzes_passed', label: 'Quizzes Passed' },
    { value: 'lessons_finished', label: 'Lessons Finished' },
    { value: 'study_hours', label: 'Study Hours' },
    { value: 'perfect_scores', label: 'Perfect Scores' },
    { value: 'streak_days', label: 'Streak Days' },
    { value: 'custom', label: 'Custom' }
  ];

  return (
    <div className="admin-achievements">
      {/* Welcome Section */}
      <div className="admin-dashboard-welcome">
        <div className="admin-dashboard-welcome-content">
          <h1 className="admin-dashboard-title">Achievements Management</h1>
          <p className="admin-dashboard-subtitle">Create and manage student achievements and rewards</p>
        </div>
        <div className="admin-achievements-actions">
          <button onClick={() => setBulkImportModalOpen(true)} className="admin-btn admin-btn-secondary">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            Bulk Import
          </button>
          <button onClick={handleCreateClick} className="admin-btn admin-btn-primary">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Create Achievement
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="admin-dashboard-metrics">
        <StatCard 
          title="Total Achievements" 
          value={achievements.length} 
          icon="trophy"
          color="primary"
        />
        <StatCard 
          title="Active" 
          value={achievements.filter(a => a.isActive).length}
          hint={`${((achievements.filter(a => a.isActive).length / (achievements.length || 1)) * 100).toFixed(0)}% of total`}
          icon="check"
          color="green"
        />
        <StatCard 
          title="Inactive" 
          value={achievements.filter(a => !a.isActive).length}
          hint={`${((achievements.filter(a => !a.isActive).length / (achievements.length || 1)) * 100).toFixed(0)}% of total`}
          icon="pause"
          color="orange"
        />
        <StatCard 
          title="Total Points" 
          value={achievements.reduce((sum, a) => sum + a.points, 0)}
          hint={`Avg ${achievements.length ? Math.round(achievements.reduce((sum, a) => sum + a.points, 0) / achievements.length) : 0} per achievement`}
          icon="star"
          color="yellow"
        />
      </div>

      {/* Filters */}
      <div className="admin-achievements-filters">
        <div className="admin-achievements-search">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
          <input
            type="text"
            placeholder="Search achievements by name or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="admin-achievements-search-input"
          />
        </div>
        
        <div className="admin-achievements-tabs">
          {categories.map(cat => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`admin-tab ${selectedCategory === cat.value ? 'active' : ''}`}
            >
              <span className="admin-tab-icon">{cat.icon}</span>
              <span className="admin-tab-label">{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Achievements List */}
      {Object.keys(achievementsByCategory).length === 0 ? (
        <div className="admin-empty-state">
          <div className="admin-empty-icon">🏆</div>
          <h3 className="admin-empty-title">No achievements found</h3>
          <p className="admin-empty-subtitle">Create your first achievement to reward student progress</p>
          <button onClick={handleCreateClick} className="admin-btn admin-btn-primary" style={{ marginTop: "16px" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Create First Achievement
          </button>
        </div>
      ) : (
        Object.entries(achievementsByCategory).map(([category, categoryAchievements]) => (
          <div key={category} className="admin-achievements-category">
            <div className="admin-section-header">
              <h2 className="admin-section-title">
                <span className="admin-section-icon">{categories.find(c => c.value === category)?.icon}</span>
                {category.charAt(0).toUpperCase() + category.slice(1)}
                <span className="admin-section-count">({categoryAchievements.length})</span>
              </h2>
            </div>
            
            <div className="admin-achievements-grid">
              {categoryAchievements.map(achievement => (
                <div
                  key={achievement._id || achievement.id}
                  className={`admin-achievement-card ${!achievement.isActive ? 'inactive' : ''}`}
                  style={{ borderColor: achievement.isActive ? rarityColors[achievement.rarity] : '#e5e7eb' }}
                >
                  <div className="admin-achievement-header">
                    <div className="admin-achievement-icon-wrapper">
                      <div className="admin-achievement-icon" style={{ background: rarityGradients[achievement.rarity] }}>
                        {iconMap[achievement.icon]}
                      </div>
                      <div className="admin-achievement-info">
                        <div className="admin-achievement-name">{achievement.name}</div>
                        <div 
                          className="admin-achievement-rarity" 
                          style={{ color: rarityColors[achievement.rarity] }}
                        >
                          {achievement.rarity}
                        </div>
                      </div>
                    </div>
                    <span className={`admin-badge ${achievement.isActive ? 'admin-badge-success' : 'admin-badge-danger'}`}>
                      {achievement.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                  
                  <p className="admin-achievement-description">{achievement.description}</p>
                  
                  <div className="admin-achievement-details">
                    <div className="admin-achievement-requirement">
                      <div className="admin-achievement-label">Requirement</div>
                      <div className="admin-achievement-value">
                        {requirementTypes.find(t => t.value === achievement.requirement.type)?.label}: {achievement.requirement.threshold}
                      </div>
                    </div>
                    <div className="admin-achievement-points">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                      </svg>
                      {achievement.points} pts
                    </div>
                  </div>
                  
                  <div className="admin-achievement-actions">
                    <button onClick={() => handleEditClick(achievement)} className="admin-achievement-btn admin-achievement-btn-edit">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                      </svg>
                      Edit
                    </button>
                    <button 
                      onClick={() => onToggleStatus(achievement._id || achievement.id, !achievement.isActive)}
                      className={`admin-achievement-btn ${achievement.isActive ? 'admin-achievement-btn-disable' : 'admin-achievement-btn-enable'}`}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        {achievement.isActive ? (
                          <>
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
                          </>
                        ) : (
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        )}
                      </svg>
                      {achievement.isActive ? "Disable" : "Enable"}
                    </button>
                    <button 
                      onClick={() => handleDeleteClick(achievement)}
                      className="admin-achievement-btn admin-achievement-btn-delete"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={createModalOpen || editModalOpen}
        onClose={() => {
          setCreateModalOpen(false);
          setEditModalOpen(false);
        }}
        title={editModalOpen ? "Edit Achievement" : "Create Achievement"}
      >
        <form onSubmit={editModalOpen ? handleEditSubmit : handleCreateSubmit} className="admin-form">
          <div className="admin-form-group">
            <label className="admin-form-label">Achievement Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="e.g., First Steps"
              className="admin-form-input"
            />
          </div>
          
          <div className="admin-form-group">
            <label className="admin-form-label">Description *</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              rows={3}
              placeholder="Describe what students need to do to earn this achievement..."
              className="admin-form-textarea"
            />
          </div>
          
          <div className="admin-form-row">
            <div className="admin-form-group">
              <label className="admin-form-label">Icon *</label>
              <select
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                required
                className="admin-form-select"
              >
                {Object.entries(iconMap).map(([key, emoji]) => (
                  <option key={key} value={key}>{emoji} {key}</option>
                ))}
              </select>
            </div>
            
            <div className="admin-form-group">
              <label className="admin-form-label">Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
                className="admin-form-select"
              >
                {categories.filter(c => c.value !== 'all').map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.icon} {cat.label}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="admin-form-row">
            <div className="admin-form-group">
              <label className="admin-form-label">Points *</label>
              <input
                type="number"
                min="0"
                value={formData.points}
                onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) || 0 })}
                required
                placeholder="10"
                className="admin-form-input"
              />
            </div>
            
            <div className="admin-form-group">
              <label className="admin-form-label">Rarity *</label>
              <select
                value={formData.rarity}
                onChange={(e) => setFormData({ ...formData, rarity: e.target.value })}
                required
                className="admin-form-select"
              >
                <option value="common">⚪ Common</option>
                <option value="rare">🔵 Rare</option>
                <option value="epic">🟣 Epic</option>
                <option value="legendary">🟡 Legendary</option>
              </select>
            </div>
          </div>
          
          <div className="admin-form-group">
            <label className="admin-form-label">Requirement Type *</label>
            <select
              value={formData.requirement.type}
              onChange={(e) => setFormData({ 
                ...formData, 
                requirement: { ...formData.requirement, type: e.target.value }
              })}
              required
              className="admin-form-select"
            >
              {requirementTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>
          
          <div className="admin-form-group">
            <label className="admin-form-label">Threshold *</label>
            <input
              type="number"
              min="1"
              value={formData.requirement.threshold}
              onChange={(e) => setFormData({ 
                ...formData, 
                requirement: { ...formData.requirement, threshold: parseInt(e.target.value) || 1 }
              })}
              required
              placeholder="1"
              className="admin-form-input"
            />
            <p className="admin-form-hint">Number required to unlock this achievement</p>
          </div>
          
          <div className="admin-form-actions">
            <button
              type="button"
              onClick={() => {
                setCreateModalOpen(false);
                setEditModalOpen(false);
              }}
              className="admin-btn admin-btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="admin-btn admin-btn-primary">
              {editModalOpen ? "Update Achievement" : "Create Achievement"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Bulk Import Modal */}
      <Modal
        isOpen={bulkImportModalOpen}
        onClose={() => {
          setBulkImportModalOpen(false);
          setBulkData('');
          setBulkError('');
        }}
        title="Bulk Import Achievements"
      >
        <form onSubmit={handleBulkImportSubmit} className="admin-form">
          <div className="admin-form-group">
            <label className="admin-form-label">JSON Data (Array of Achievements)</label>
            <textarea
              value={bulkData}
              onChange={(e) => setBulkData(e.target.value)}
              rows={12}
              placeholder='[{"name":"First Steps","description":"Complete your first course","icon":"trophy","category":"learning","points":10,"requirement":{"type":"courses_completed","threshold":1},"rarity":"common"}]'
              required
              className="admin-form-textarea"
              style={{ fontFamily: "monospace", fontSize: "13px" }}
            />
            {bulkError && (
              <div className="admin-form-error">{bulkError}</div>
            )}
            <p className="admin-form-hint">Paste a JSON array of achievement objects to import multiple achievements at once</p>
          </div>
          
          <div className="admin-form-actions">
            <button
              type="button"
              onClick={() => {
                setBulkImportModalOpen(false);
                setBulkData('');
                setBulkError('');
              }}
              className="admin-btn admin-btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="admin-btn admin-btn-primary">
              Import Achievements
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Achievement"
      >
        <div className="admin-delete-confirmation">
          <div className="admin-warning-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          </div>
          <p className="admin-delete-message">
            Are you sure you want to permanently delete this achievement? This action cannot be undone.
          </p>
          {currentAchievement && (
            <div className="admin-delete-preview">
              <div className="admin-achievement-icon" style={{ background: rarityGradients[currentAchievement.rarity] }}>
                {iconMap[currentAchievement.icon]}
              </div>
              <div className="admin-delete-preview-info">
                <div className="admin-delete-preview-name">{currentAchievement.name}</div>
                <div className="admin-delete-preview-desc">{currentAchievement.description}</div>
                <div className="admin-delete-preview-meta">
                  <span className="admin-achievement-rarity" style={{ color: rarityColors[currentAchievement.rarity] }}>
                    {currentAchievement.rarity}
                  </span>
                  · {currentAchievement.points} points
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="admin-form-actions">
          <button onClick={() => setDeleteModalOpen(false)} className="admin-btn admin-btn-secondary">
            Cancel
          </button>
          <button onClick={handleDeleteConfirm} className="admin-btn admin-btn-danger">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
            Delete Achievement
          </button>
        </div>
      </Modal>
    </div>
  );
}

export default Achievements;
