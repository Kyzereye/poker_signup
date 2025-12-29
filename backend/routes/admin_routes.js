const express = require('express');
const pool = require('../connection.js');
const router = express.Router();
const { authenticateToken, requireAdmin } = require('../middleware/auth.middleware');

// Get admin dashboard data
router.get('/dashboard_data', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Get user statistics
    const userStatsQuery = `
      SELECT 
        COUNT(*) as totalUsers,
        SUM(CASE WHEN r.name = 'admin' THEN 1 ELSE 0 END) as adminUsers,
        SUM(CASE WHEN r.name = 'dealer' THEN 1 ELSE 0 END) as dealerUsers,
        SUM(CASE WHEN r.name = 'player' THEN 1 ELSE 0 END) as playerUsers
      FROM users u
      LEFT JOIN user_features uf ON u.id = uf.user_id
      LEFT JOIN roles r ON uf.role_id = r.id
    `;
    const [userStats] = await pool.query(userStatsQuery);

    // Get recent users (last 10)
    const recentUsersQuery = `
      SELECT 
        u.id,
        u.username,
        u.email,
        uf.first_name,
        uf.last_name,
        uf.phone,
        r.name as role
      FROM users u
      LEFT JOIN user_features uf ON u.id = uf.user_id
      LEFT JOIN roles r ON uf.role_id = r.id
      ORDER BY u.id DESC
      LIMIT 10
    `;
    const [recentUsers] = await pool.query(recentUsersQuery);

    // Get system info
    const systemInfoQuery = `
      SELECT 
        (SELECT COUNT(*) FROM games) as totalGames,
        (SELECT COUNT(*) FROM user_game_signups) as activeSignups
    `;
    const [systemInfo] = await pool.query(systemInfoQuery);

    const dashboardData = {
      userStats: {
        totalUsers: parseInt(userStats[0].totalUsers),
        adminUsers: parseInt(userStats[0].adminUsers),
        dealerUsers: parseInt(userStats[0].dealerUsers),
        playerUsers: parseInt(userStats[0].playerUsers)
      },
      recentUsers: recentUsers,
      systemInfo: {
        databaseStatus: 'healthy',
        totalGames: parseInt(systemInfo[0].totalGames),
        activeSignups: parseInt(systemInfo[0].activeSignups)
      }
    };

    res.status(200).json(dashboardData);
  } catch (error) {
    console.error('Dashboard data error:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message 
    });
  }
});

// Get user statistics
router.get('/user_stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const query = `
      SELECT 
        COUNT(*) as totalUsers,
        SUM(CASE WHEN r.name = 'admin' THEN 1 ELSE 0 END) as adminUsers,
        SUM(CASE WHEN r.name = 'dealer' THEN 1 ELSE 0 END) as dealerUsers,
        SUM(CASE WHEN r.name = 'player' THEN 1 ELSE 0 END) as playerUsers
      FROM users u
      LEFT JOIN user_features uf ON u.id = uf.user_id
      LEFT JOIN roles r ON uf.role_id = r.id
    `;
    const [results] = await pool.query(query);
    
    const stats = {
      totalUsers: parseInt(results[0].totalUsers),
      adminUsers: parseInt(results[0].adminUsers),
      dealerUsers: parseInt(results[0].dealerUsers),
      playerUsers: parseInt(results[0].playerUsers)
    };

    res.status(200).json(stats);
  } catch (error) {
    console.error('User stats error:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message 
    });
  }
});

// Get all users with pagination
router.get('/users', authenticateToken, requireAdmin, async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  try {
    // Get total count
    const countQuery = 'SELECT COUNT(*) as total FROM users';
    const [countResult] = await pool.query(countQuery);
    const total = parseInt(countResult[0].total);

    // Get users with pagination
    const usersQuery = `
      SELECT 
        u.id,
        u.username,
        u.email,
        uf.first_name,
        uf.last_name,
        uf.phone,
        uf.role
      FROM users u
      LEFT JOIN user_features uf ON u.id = uf.user_id
      ORDER BY u.id DESC
      LIMIT ? OFFSET ?
    `;
    const [users] = await pool.query(usersQuery, [parseInt(limit), offset]);

    const response = {
      users: users,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message 
    });
  }
});

// Get all users (for user management)
router.get('/all_users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const query = `
      SELECT 
        u.id,
        u.username,
        u.email,
        uf.first_name,
        uf.last_name,
        r.name as role
      FROM users u
      LEFT JOIN user_features uf ON u.id = uf.user_id
      LEFT JOIN roles r ON uf.role_id = r.id
      ORDER BY u.username ASC
    `;
    const [users] = await pool.query(query);

    res.status(200).json(users);
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message 
    });
  }
});

// Get user by ID
router.get('/users/:userId', authenticateToken, requireAdmin, async (req, res) => {
  const { userId } = req.params;

  try {
    const query = `
      SELECT 
        u.id,
        u.username,
        u.email,
        uf.first_name,
        uf.last_name,
        uf.phone,
        uf.role
      FROM users u
      LEFT JOIN user_features uf ON u.id = uf.user_id
      WHERE u.id = ?
    `;
    const [results] = await pool.query(query, [userId]);

    if (results.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = results[0];

    res.status(200).json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message 
    });
  }
});

// Update user role
router.put('/users/:userId/role', authenticateToken, requireAdmin, async (req, res) => {
  const { userId } = req.params;
  const { role } = req.body;

  if (!role || !['player', 'dealer', 'admin'].includes(role)) {
    return res.status(400).json({ 
      error: 'Invalid role. Must be player, dealer, or admin' 
    });
  }

  try {
    // Check if user exists
    const checkQuery = 'SELECT id FROM users WHERE id = ?';
    const [existing] = await pool.query(checkQuery, [userId]);
    
    if (existing.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get role_id from role name
    const roleQuery = 'SELECT id FROM roles WHERE name = ?';
    const [roleResult] = await pool.query(roleQuery, [role]);
    
    if (roleResult.length === 0) {
      return res.status(400).json({ error: 'Invalid role name' });
    }
    
    const roleId = roleResult[0].id;

    // Update role_id in user_features
    const updateQuery = `
      UPDATE user_features 
      SET role_id = ? 
      WHERE user_id = ?
    `;
    await pool.query(updateQuery, [roleId, userId]);

    res.status(200).json({ 
      success: true, 
      message: 'User role updated successfully' 
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message 
    });
  }
});

// Create new user
router.post('/create_user', authenticateToken, requireAdmin, async (req, res) => {
  const { username, email, password, first_name, last_name, role = 'player' } = req.body;

  // Validate required fields
  if (!username || !email || !password || !first_name || !last_name) {
    return res.status(400).json({ 
      error: 'Missing required fields: username, email, password, first_name, last_name' 
    });
  }

  // Validate role
  if (!['player', 'dealer', 'admin'].includes(role)) {
    return res.status(400).json({ 
      error: 'Invalid role. Must be player, dealer, or admin' 
    });
  }

  try {
    // Check if username or email already exists
    const checkQuery = 'SELECT id FROM users WHERE username = ? OR email = ?';
    const [existing] = await pool.query(checkQuery, [username, email]);
    
    if (existing.length > 0) {
      return res.status(409).json({ 
        error: 'Username or email already exists' 
      });
    }

    // Start transaction
    await pool.query('START TRANSACTION');

    try {
      // Hash password
      const bcrypt = require('bcrypt');
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Insert into users table
      const insertUserQuery = `
        INSERT INTO users (username, email, password) 
        VALUES (?, ?, ?)
      `;
      const [userResult] = await pool.query(insertUserQuery, [username, email, hashedPassword]);
      const userId = userResult.insertId;

      // Get role_id from role name
      const roleQuery = 'SELECT id FROM roles WHERE name = ?';
      const [roleResult] = await pool.query(roleQuery, [role]);
      const roleId = roleResult[0]?.id || 1; // Default to player if role not found

      // Insert into user_features table
      const insertFeaturesQuery = `
        INSERT INTO user_features (user_id, first_name, last_name, role_id) 
        VALUES (?, ?, ?, ?)
      `;
      await pool.query(insertFeaturesQuery, [userId, first_name, last_name, roleId]);

      await pool.query('COMMIT');
      res.status(201).json({ 
        success: true, 
        message: 'User created successfully',
        user_id: userId
      });
    } catch (error) {
      await pool.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message 
    });
  }
});

// Update user information
router.put('/users/:userId', authenticateToken, requireAdmin, async (req, res) => {
  const { userId } = req.params;
  const { username, email, first_name, last_name, phone } = req.body;

  try {
    // Check if user exists
    const checkQuery = 'SELECT id FROM users WHERE id = ?';
    const [existing] = await pool.query(checkQuery, [userId]);
    
    if (existing.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Start transaction
    await pool.query('START TRANSACTION');

    try {
      // Update users table
      if (username || email) {
        const updateUsersQuery = `
          UPDATE users 
          SET ${username ? 'username = ?' : ''}${username && email ? ', ' : ''}${email ? 'email = ?' : ''}
          WHERE id = ?
        `;
        
        const updateParams = [];
        if (username) updateParams.push(username);
        if (email) updateParams.push(email);
        updateParams.push(userId);
        
        await pool.query(updateUsersQuery, updateParams);
      }

      // Update user_features table
      if (first_name || last_name || phone) {
        const updateFeaturesQuery = `
          UPDATE user_features 
          SET ${first_name ? 'first_name = ?' : ''}${first_name && last_name ? ', ' : ''}${last_name ? 'last_name = ?' : ''}${(first_name || last_name) && phone ? ', ' : ''}${phone ? 'phone = ?' : ''}
          WHERE user_id = ?
        `;
        
        const updateFeaturesParams = [];
        if (first_name) updateFeaturesParams.push(first_name);
        if (last_name) updateFeaturesParams.push(last_name);
        if (phone) updateFeaturesParams.push(phone);
        updateFeaturesParams.push(userId);
        
        await pool.query(updateFeaturesQuery, updateFeaturesParams);
      }

      await pool.query('COMMIT');
      res.status(200).json({ 
        success: true, 
        message: 'User updated successfully' 
      });
    } catch (error) {
      await pool.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message 
    });
  }
});

// Update user (for user management)
router.put('/update_user/:userId', authenticateToken, requireAdmin, async (req, res) => {
  const { userId } = req.params;
  const { username, email, password, first_name, last_name, role } = req.body;

  try {
    // Check if user exists
    const checkQuery = 'SELECT id FROM users WHERE id = ?';
    const [existing] = await pool.query(checkQuery, [userId]);
    
    if (existing.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Validate role if provided
    if (role && !['player', 'dealer', 'admin'].includes(role)) {
      return res.status(400).json({ 
        error: 'Invalid role. Must be player, dealer, or admin' 
      });
    }

    // Start transaction
    await pool.query('START TRANSACTION');

    try {
      // Update users table
      if (username || email || password) {
        let updateUsersQuery = 'UPDATE users SET ';
        const updateParams = [];
        
        if (username) {
          updateUsersQuery += 'username = ?';
          updateParams.push(username);
        }
        if (email) {
          if (updateParams.length > 0) updateUsersQuery += ', ';
          updateUsersQuery += 'email = ?';
          updateParams.push(email);
        }
        if (password) {
          if (updateParams.length > 0) updateUsersQuery += ', ';
          updateUsersQuery += 'password = ?';
          const bcrypt = require('bcrypt');
          const saltRounds = 10;
          const hashedPassword = await bcrypt.hash(password, saltRounds);
          updateParams.push(hashedPassword);
        }
        
        updateUsersQuery += ' WHERE id = ?';
        updateParams.push(userId);
        
        await pool.query(updateUsersQuery, updateParams);
      }

      // Update user_features table
      if (first_name || last_name || role) {
        let updateFeaturesQuery = 'UPDATE user_features SET ';
        const updateFeaturesParams = [];
        
        if (first_name) {
          updateFeaturesQuery += 'first_name = ?';
          updateFeaturesParams.push(first_name);
        }
        if (last_name) {
          if (updateFeaturesParams.length > 0) updateFeaturesQuery += ', ';
          updateFeaturesQuery += 'last_name = ?';
          updateFeaturesParams.push(last_name);
        }
        if (role) {
          // Get role_id from role name
          const roleQuery = 'SELECT id FROM roles WHERE name = ?';
          const [roleResult] = await pool.query(roleQuery, [role]);
          
          if (roleResult.length === 0) {
            throw new Error('Invalid role name');
          }
          
          const roleId = roleResult[0].id;
          
          if (updateFeaturesParams.length > 0) updateFeaturesQuery += ', ';
          updateFeaturesQuery += 'role_id = ?';
          updateFeaturesParams.push(roleId);
        }
        
        updateFeaturesQuery += ' WHERE user_id = ?';
        updateFeaturesParams.push(userId);
        
        await pool.query(updateFeaturesQuery, updateFeaturesParams);
      }

      await pool.query('COMMIT');
      res.status(200).json({ 
        success: true, 
        message: 'User updated successfully' 
      });
    } catch (error) {
      await pool.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message 
    });
  }
});

// Delete user
router.delete('/delete_user/:userId', authenticateToken, requireAdmin, async (req, res) => {
  const { userId } = req.params;

  try {
    // Check if user exists
    const checkQuery = 'SELECT id FROM users WHERE id = ?';
    const [existing] = await pool.query(checkQuery, [userId]);
    
    if (existing.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if user has any signups (optional safety check)
    const signupsQuery = 'SELECT COUNT(*) as count FROM user_game_signups WHERE user_id = ?';
    const [signups] = await pool.query(signupsQuery, [userId]);
    
    if (parseInt(signups[0].count) > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete user with active game signups. Please remove signups first.' 
      });
    }

    // Start transaction
    await pool.query('START TRANSACTION');

    try {
      // Delete from user_features first (due to foreign key)
      const deleteFeaturesQuery = 'DELETE FROM user_features WHERE user_id = ?';
      await pool.query(deleteFeaturesQuery, [userId]);

      // Delete from users table
      const deleteUserQuery = 'DELETE FROM users WHERE id = ?';
      await pool.query(deleteUserQuery, [userId]);

      await pool.query('COMMIT');
      res.status(200).json({ 
        success: true, 
        message: 'User deleted successfully' 
      });
    } catch (error) {
      await pool.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message 
    });
  }
});

// Get system information
router.get('/system_info', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const query = `
      SELECT 
        (SELECT COUNT(*) FROM users) as totalUsers,
        (SELECT COUNT(*) FROM games) as totalGames,
        (SELECT COUNT(*) FROM user_game_signups) as activeSignups,
        (SELECT COUNT(*) FROM locations) as totalLocations
    `;
    const [results] = await pool.query(query);

    const systemInfo = {
      databaseStatus: 'healthy',
      totalUsers: parseInt(results[0].totalUsers),
      totalGames: parseInt(results[0].totalGames),
      activeSignups: parseInt(results[0].activeSignups),
      totalLocations: parseInt(results[0].totalLocations),
      lastUpdated: new Date().toISOString()
    };

    res.status(200).json(systemInfo);
  } catch (error) {
    console.error('System info error:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message 
    });
  }
});

// Refresh data
router.post('/refresh_data', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // This endpoint can be used to refresh cached data or perform maintenance
    // For now, just return the dashboard data
    const dashboardData = await getDashboardData();
    res.status(200).json(dashboardData);
  } catch (error) {
    console.error('Refresh data error:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message 
    });
  }
});

// Helper function to get dashboard data
async function getDashboardData() {
  const userStatsQuery = `
    SELECT 
      COUNT(*) as totalUsers,
      SUM(CASE WHEN uf.role = 'admin' THEN 1 ELSE 0 END) as adminUsers,
      SUM(CASE WHEN uf.role = 'dealer' THEN 1 ELSE 0 END) as dealerUsers,
      SUM(CASE WHEN uf.role = 'player' THEN 1 ELSE 0 END) as playerUsers
    FROM users u
    LEFT JOIN user_features uf ON u.id = uf.user_id
  `;
  const [userStats] = await pool.query(userStatsQuery);

  const recentUsersQuery = `
    SELECT 
      u.id,
      u.username,
      u.email,
      uf.first_name,
      uf.last_name,
      uf.phone,
      uf.role
    FROM users u
    LEFT JOIN user_features uf ON u.id = uf.user_id
    ORDER BY u.id DESC
    LIMIT 10
  `;
  const [recentUsers] = await pool.query(recentUsersQuery);

  const systemInfoQuery = `
    SELECT 
      (SELECT COUNT(*) FROM games) as totalGames,
      (SELECT COUNT(*) FROM user_game_signups) as activeSignups
  `;
  const [systemInfo] = await pool.query(systemInfoQuery);

  return {
    userStats: {
      totalUsers: parseInt(userStats[0].totalUsers),
      adminUsers: parseInt(userStats[0].adminUsers),
      dealerUsers: parseInt(userStats[0].dealerUsers),
      playerUsers: parseInt(userStats[0].playerUsers)
    },
    recentUsers: recentUsers,
    systemInfo: {
      databaseStatus: 'healthy',
      totalGames: parseInt(systemInfo[0].totalGames),
      activeSignups: parseInt(systemInfo[0].activeSignups)
    }
  };
}

// ==================== ROLE MANAGEMENT ENDPOINTS ====================

// Get all roles
router.get('/roles', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const query = `
      SELECT 
        r.id,
        r.name,
        r.description,
        r.created_at,
        COUNT(uf.user_id) as user_count
      FROM roles r
      LEFT JOIN user_features uf ON r.id = uf.role_id
      GROUP BY r.id, r.name, r.description, r.created_at
      ORDER BY r.id ASC
    `;
    const [roles] = await pool.query(query);
    res.status(200).json(roles);
  } catch (error) {
    console.error('Get roles error:', error);
    res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
});

// Get single role by ID
router.get('/roles/:id', authenticateToken, requireAdmin, async (req, res) => {
  const { id } = req.params;
  
  try {
    const query = `
      SELECT 
        r.id,
        r.name,
        r.description,
        r.created_at,
        COUNT(uf.user_id) as user_count
      FROM roles r
      LEFT JOIN user_features uf ON r.id = uf.role_id
      WHERE r.id = ?
      GROUP BY r.id, r.name, r.description, r.created_at
    `;
    const [roles] = await pool.query(query, [id]);
    
    if (roles.length === 0) {
      return res.status(404).json({ error: 'Role not found' });
    }
    
    res.status(200).json(roles[0]);
  } catch (error) {
    console.error('Get role error:', error);
    res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
});

// Create new role
router.post('/roles', authenticateToken, requireAdmin, async (req, res) => {
  const { name, description } = req.body;
  
  if (!name || name.trim() === '') {
    return res.status(400).json({ 
      error: 'Role name is required' 
    });
  }
  
  // Validate name format (alphanumeric and underscores only)
  const nameRegex = /^[a-zA-Z0-9_]+$/;
  if (!nameRegex.test(name)) {
    return res.status(400).json({ 
      error: 'Role name can only contain letters, numbers, and underscores' 
    });
  }
  
  try {
    // Check if role name already exists
    const checkQuery = 'SELECT id FROM roles WHERE name = ?';
    const [existing] = await pool.query(checkQuery, [name]);
    
    if (existing.length > 0) {
      return res.status(409).json({ 
        error: 'Role name already exists' 
      });
    }
    
    // Insert new role
    const insertQuery = `
      INSERT INTO roles (name, description) 
      VALUES (?, ?)
    `;
    const [result] = await pool.query(insertQuery, [name, description || null]);
    
    res.status(201).json({
      success: true,
      message: 'Role created successfully',
      role_id: result.insertId
    });
  } catch (error) {
    console.error('Create role error:', error);
    res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
});

// Update role
router.put('/roles/:id', authenticateToken, requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;
  
  if (!name || name.trim() === '') {
    return res.status(400).json({ 
      error: 'Role name is required' 
    });
  }
  
  // Validate name format
  const nameRegex = /^[a-zA-Z0-9_]+$/;
  if (!nameRegex.test(name)) {
    return res.status(400).json({ 
      error: 'Role name can only contain letters, numbers, and underscores' 
    });
  }
  
  try {
    // Check if role exists
    const checkQuery = 'SELECT id FROM roles WHERE id = ?';
    const [existing] = await pool.query(checkQuery, [id]);
    
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Role not found' });
    }
    
    // Check if new name conflicts with existing role
    const nameCheckQuery = 'SELECT id FROM roles WHERE name = ? AND id != ?';
    const [nameConflict] = await pool.query(nameCheckQuery, [name, id]);
    
    if (nameConflict.length > 0) {
      return res.status(409).json({ 
        error: 'Role name already exists' 
      });
    }
    
    // Update role
    const updateQuery = `
      UPDATE roles 
      SET name = ?, description = ? 
      WHERE id = ?
    `;
    await pool.query(updateQuery, [name, description || null, id]);
    
    res.status(200).json({
      success: true,
      message: 'Role updated successfully'
    });
  } catch (error) {
    console.error('Update role error:', error);
    res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
});

// Delete role
router.delete('/roles/:id', authenticateToken, requireAdmin, async (req, res) => {
  const { id } = req.params;
  
  try {
    // Check if role exists
    const checkQuery = 'SELECT id FROM roles WHERE id = ?';
    const [existing] = await pool.query(checkQuery, [id]);
    
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Role not found' });
    }
    
    // Check if role is in use
    const usageQuery = 'SELECT COUNT(*) as count FROM user_features WHERE role_id = ?';
    const [usage] = await pool.query(usageQuery, [id]);
    const userCount = parseInt(usage[0].count);
    
    if (userCount > 0) {
      return res.status(409).json({ 
        error: `Cannot delete role. ${userCount} user(s) are currently assigned to this role.`,
        user_count: userCount
      });
    }
    
    // Delete role
    const deleteQuery = 'DELETE FROM roles WHERE id = ?';
    await pool.query(deleteQuery, [id]);
    
    res.status(200).json({
      success: true,
      message: 'Role deleted successfully'
    });
  } catch (error) {
    console.error('Delete role error:', error);
    res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
});

module.exports = router;
