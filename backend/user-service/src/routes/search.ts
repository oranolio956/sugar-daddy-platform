import { Router } from 'express';
import { SearchService } from '../services/searchService';
import { SearchFilter } from '../models/SearchFilter';
import { User } from '../models/User';
import { globalRateLimit, sensitiveOperationRateLimit } from '../middleware';
import { Op } from 'sequelize';

const router = Router();
const searchService = new SearchService();

/**
 * @route   POST /api/search/filters
 * @desc    Create or update search filter
 * @access  Private
 */
router.post('/filters',
  globalRateLimit,
  sensitiveOperationRateLimit,
  async (req, res) => {
    try {
      const userId = req.user.id;
      const filterData = req.body;

      // Validate filter data
      if (!filterData.name) {
        return res.status(400).json({
          success: false,
          message: 'Filter name is required'
        });
      }

      const filter = await SearchFilter.findOne({
        where: { userId, name: filterData.name }
      });

      if (filter) {
        // Update existing filter
        await filter.update(filterData);
        res.status(200).json({
          success: true,
          data: filter,
          message: 'Search filter updated successfully'
        });
      } else {
        // Create new filter
        const newFilter = await SearchFilter.create({
          ...filterData,
          userId
        });
        res.status(201).json({
          success: true,
          data: newFilter,
          message: 'Search filter created successfully'
        });
      }
    } catch (error: any) {
      console.error('Search filter error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to manage search filter'
      });
    }
  }
);

/**
 * @route   GET /api/search/filters
 * @desc    Get user's search filters
 * @access  Private
 */
router.get('/filters',
  globalRateLimit,
  async (req, res) => {
    try {
      const userId = req.user.id;
      const filters = await SearchFilter.findAll({
        where: { userId, isActive: true },
        order: [['usageCount', 'DESC'], ['updatedAt', 'DESC']]
      });

      res.status(200).json({
        success: true,
        data: filters
      });
    } catch (error: any) {
      console.error('Get filters error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get search filters'
      });
    }
  }
);

/**
 * @route   DELETE /api/search/filters/:id
 * @desc    Delete search filter
 * @access  Private
 */
router.delete('/filters/:id',
  globalRateLimit,
  sensitiveOperationRateLimit,
  async (req, res) => {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      const filter = await SearchFilter.findOne({
        where: { id, userId }
      });

      if (!filter) {
        return res.status(404).json({
          success: false,
          message: 'Search filter not found'
        });
      }

      await filter.destroy();

      res.status(200).json({
        success: true,
        message: 'Search filter deleted successfully'
      });
    } catch (error: any) {
      console.error('Delete filter error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to delete search filter'
      });
    }
  }
);

/**
 * @route   POST /api/search/advanced
 * @desc    Perform advanced search with filters
 * @access  Private
 */
router.post('/advanced',
  globalRateLimit,
  async (req, res) => {
    try {
      const userId = req.user.id;
      const searchParams = req.body;

      // Get user's preferences for default values
      const user = await User.findByPk(userId, {
        attributes: ['preferences']
      });

      const results = await searchService.advancedSearch(userId, {
        ...user?.preferences,
        ...searchParams
      });

      // Update filter usage count if filterId is provided
      if (searchParams.filterId) {
        await SearchFilter.increment('usageCount', {
          where: { id: searchParams.filterId, userId }
        });
        await SearchFilter.update(
          { lastUsedAt: new Date() },
          { where: { id: searchParams.filterId, userId } }
        );
      }

      res.status(200).json({
        success: true,
        data: results
      });
    } catch (error: any) {
      console.error('Advanced search error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Advanced search failed'
      });
    }
  }
);

/**
 * @route   GET /api/search/suggestions
 * @desc    Get search suggestions based on user behavior
 * @access  Private
 */
router.get('/suggestions',
  globalRateLimit,
  async (req, res) => {
    try {
      const userId = req.user.id;
      const suggestions = await searchService.getSearchSuggestions(userId);

      res.status(200).json({
        success: true,
        data: suggestions
      });
    } catch (error: any) {
      console.error('Search suggestions error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get search suggestions'
      });
    }
  }
);

/**
 * @route   GET /api/search/popular
 * @desc    Get popular search filters and criteria
 * @access  Public
 */
router.get('/popular',
  globalRateLimit,
  async (req, res) => {
    try {
      const popularFilters = await SearchFilter.findAll({
        where: { isActive: true },
        attributes: ['name', 'filters', 'usageCount'],
        order: [['usageCount', 'DESC']],
        limit: 10
      });

      res.status(200).json({
        success: true,
        data: popularFilters
      });
    } catch (error: any) {
      console.error('Popular searches error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get popular searches'
      });
    }
  }
);

export default router;