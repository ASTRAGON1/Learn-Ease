import React, { useState } from "react";
import StatCard from "./StatCard";
import "./Achievements.css";

// Badge emoji mapping
const badgeEmojis = {
  platinum: '🏆',
  gold: '🥇',
  silver: '🥈'
};

// Badge colors
const badgeColors = {
  platinum: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)',
  gold: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
  silver: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)'
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
  onDeleteAchievement
}) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  
  // Form states
  const [currentAchievement, setCurrentAchievement] = useState(null);
  const [formData, setFormData] = useState({
    type: 'course',
    title: '',
    course: '',
    badge: 'gold',
    description: '',
    category: 'Core Course'
  });

  // Filter achievements
  const filteredAchievements = achievements.filter(achievement => {
    const matchesCategory = selectedCategory === 'all' || achievement.category === selectedCategory;
    const achievementTitle = achievement.title || '';
    const achievementDesc = achievement.description || '';
    const achievementCourse = achievement.course || '';
    const matchesSearch = achievementTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         achievementDesc.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         achievementCourse.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Group by category
  const groupedAchievements = filteredAchievements.reduce((acc, achievement) => {
    const cat = achievement.category || 'Other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(achievement);
    return acc;
  }, {});

  const resetForm = () => {
    setFormData({
      type: 'course',
      title: '',
      course: '',
      badge: 'gold',
      description: '',
      category: 'Core Course'
    });
    setCurrentAchievement(null);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    await onCreateAchievement(formData);
    setCreateModalOpen(false);
    resetForm();
  };

  const handleEdit = (achievement) => {
    setCurrentAchievement(achievement);
    setFormData({
      type: achievement.type,
      title: achievement.title,
      course: achievement.course,
      badge: achievement.badge,
      description: achievement.description,
      category: achievement.category
    });
    setEditModalOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    await onUpdateAchievement(currentAchievement._id || currentAchievement.id, formData);
    setEditModalOpen(false);
    resetForm();
  };

  const handleDeleteClick = (achievement) => {
    setCurrentAchievement(achievement);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (currentAchievement) {
      await onDeleteAchievement(currentAchievement._id || currentAchievement.id);
      setDeleteModalOpen(false);
      setCurrentAchievement(null);
    }
  };

  const categories = [
    { value: 'all', label: 'All Categories', icon: '📋' },
    { value: 'Core Course', label: 'Core Course', icon: '📚' },
    { value: 'Extra Course', label: 'Extra Course', icon: '⭐' }
  ];

  return (
    <div className="admin-achievements">
      {/* Welcome Section */}
      <div className="admin-dashboard-welcome">
        <div className="admin-dashboard-welcome-content">
          <h1 className="admin-dashboard-title">Achievements Management</h1>
          <p className="admin-dashboard-subtitle">Create and manage student achievements and rewards</p>
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
          title="Core Courses" 
          value={achievements.filter(a => a.category === 'Core Course').length}
          hint={`${((achievements.filter(a => a.category === 'Core Course').length / (achievements.length || 1)) * 100).toFixed(0)}% of total`}
          icon="book"
          color="blue"
        />
        <StatCard 
          title="Extra Courses" 
          value={achievements.filter(a => a.category === 'Extra Course').length}
          hint={`${((achievements.filter(a => a.category === 'Extra Course').length / (achievements.length || 1)) * 100).toFixed(0)}% of total`}
          icon="star"
          color="yellow"
        />
        <StatCard 
          title="Platinum Badges" 
          value={achievements.filter(a => a.badge === 'platinum').length}
          hint={`Highest tier achievements`}
          icon="medal"
          color="purple"
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
            placeholder="Search achievements by title, course, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="admin-achievements-search-input"
          />
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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

          <div className="admin-achievements-actions">
            <button onClick={() => { resetForm(); setCreateModalOpen(true); }} className="admin-btn admin-btn-primary">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Create Achievement
            </button>
          </div>
        </div>
      </div>

      {/* Achievements List */}
      {Object.keys(groupedAchievements).length > 0 ? (
        Object.entries(groupedAchievements).map(([category, categoryAchievements]) => (
          <div key={category} className="admin-achievements-category">
            <div className="admin-section-header">
              <h2 className="admin-section-title">
                <span className="admin-section-icon">{categories.find(c => c.value === category)?.icon || '📋'}</span>
                {category}
                <span className="admin-section-count">({categoryAchievements.length})</span>
              </h2>
            </div>
            <div className="admin-achievements-grid">
              {categoryAchievements.map((achievement) => (
                <div
                  key={achievement._id || achievement.id}
                  className="admin-achievement-card"
                >
                  <div className="admin-achievement-header">
                    <div className="admin-achievement-icon-wrapper">
                      <div className="admin-achievement-icon" style={{ background: badgeColors[achievement.badge] }}>
                        {badgeEmojis[achievement.badge]}
                      </div>
                      <div className="admin-achievement-info">
                        <div className="admin-achievement-name">{achievement.title}</div>
                        <div 
                          className="admin-achievement-rarity" 
                          style={{ color: achievement.badge === 'platinum' ? '#6366f1' : achievement.badge === 'gold' ? '#f59e0b' : '#6b7280' }}
                        >
                          {achievement.badge.toUpperCase()} BADGE
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="admin-achievement-description">{achievement.description}</p>

                  <div className="admin-achievement-details">
                    <div className="admin-achievement-requirement">
                      <div className="admin-achievement-label">Course</div>
                      <div className="admin-achievement-value">
                        {achievement.course}
                      </div>
                    </div>
                    <div className="admin-achievement-requirement">
                      <div className="admin-achievement-label">Type</div>
                      <div className="admin-achievement-value">
                        {achievement.type === 'course' ? 'Core' : 'Extra'}
                      </div>
                    </div>
                  </div>

                  <div className="admin-achievement-actions">
                    <button 
                      onClick={() => handleEdit(achievement)}
                      className="admin-achievement-btn admin-achievement-btn-edit"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                      </svg>
                      Edit
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
      ) : (
        <div className="admin-empty-state">
          <div className="admin-empty-icon">🏆</div>
          <h3 className="admin-empty-title">No Achievements Found</h3>
          <p className="admin-empty-subtitle">Create your first achievement to get started</p>
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal 
        isOpen={createModalOpen || editModalOpen} 
        onClose={() => { setCreateModalOpen(false); setEditModalOpen(false); resetForm(); }}
        title={editModalOpen ? "Edit Achievement" : "Create Achievement"}
      >
        <form onSubmit={editModalOpen ? handleUpdate : handleCreate} className="admin-form">
          <div className="admin-form-group">
            <label className="admin-form-label">Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              className="admin-form-input"
              placeholder="e.g., Listening Skills Master"
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">Description *</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              className="admin-form-textarea"
              rows={3}
              placeholder="Describe this achievement..."
            />
          </div>

          <div className="admin-form-row">
            <div className="admin-form-group">
              <label className="admin-form-label">Type *</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                required
                className="admin-form-select"
              >
                <option value="course">Course</option>
                <option value="extra">Extra</option>
              </select>
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">Badge *</label>
              <select
                value={formData.badge}
                onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                required
                className="admin-form-select"
              >
                <option value="platinum">🏆 Platinum</option>
                <option value="gold">🥇 Gold</option>
                <option value="silver">🥈 Silver</option>
              </select>
            </div>
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">Course *</label>
            <input
              type="text"
              value={formData.course}
              onChange={(e) => setFormData({ ...formData, course: e.target.value })}
              required
              className="admin-form-input"
              placeholder="e.g., Listening Skills"
            />
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

          <div className="admin-form-actions">
            <button 
              type="button" 
              onClick={() => { setCreateModalOpen(false); setEditModalOpen(false); resetForm(); }}
              className="admin-btn admin-btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="admin-btn admin-btn-primary">
              {editModalOpen ? "Update" : "Create"} Achievement
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal 
        isOpen={deleteModalOpen} 
        onClose={() => { setDeleteModalOpen(false); setCurrentAchievement(null); }}
        title="Delete Achievement"
      >
        <div className="admin-delete-confirmation">
          <div className="admin-warning-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          </div>
          <p className="admin-delete-message">
            Are you sure you want to delete this achievement? This action cannot be undone.
          </p>
          {currentAchievement && (
            <div className="admin-delete-preview">
              <div className="admin-achievement-icon" style={{ background: badgeColors[currentAchievement.badge] }}>
                {badgeEmojis[currentAchievement.badge]}
              </div>
              <div className="admin-delete-preview-info">
                <div className="admin-delete-preview-name">{currentAchievement.title}</div>
                <div className="admin-delete-preview-desc">{currentAchievement.description}</div>
                <div className="admin-delete-preview-meta">
                  <span className="admin-achievement-rarity" style={{ color: currentAchievement.badge === 'platinum' ? '#6366f1' : currentAchievement.badge === 'gold' ? '#f59e0b' : '#6b7280' }}>
                    {currentAchievement.badge.toUpperCase()}
                  </span>
                  · {currentAchievement.course}
                </div>
              </div>
            </div>
          )}
          <div className="admin-form-actions">
            <button 
              onClick={() => { setDeleteModalOpen(false); setCurrentAchievement(null); }}
              className="admin-btn admin-btn-secondary"
            >
              Cancel
            </button>
            <button 
              onClick={handleDeleteConfirm}
              className="admin-btn admin-btn-danger"
            >
              Delete Achievement
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default Achievements;
