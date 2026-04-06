const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;

// Import models with error checking
let Service, Category;

try {
  Service = require('../models/Service');
  Category = require('../models/Category');
  console.log('✅ Service and Category models loaded successfully');
} catch (error) {
  console.error('❌ Error loading models:', error);
}

// Create a new service
const createService = async (req, res) => {
  console.log('Create service request received');
  console.log('Request body:', req.body);
  console.log('Request files:', req.files ? req.files.length : 0);
  console.log('User:', req.user ? req.user.id : 'No user');

  // Check if Service model is available
  if (!Service) {
    console.error('Service model is not available');
    return res.status(500).json({ msg: 'Service model not initialized' });
  }

  try {
    const {
      title,
      description,
      price,
      originalPrice,
      category,
      subCategory,
      features,
      duration,
      isAvailable,
      isPopular,
      isFeatured,
      tags,
    } = req.body;

    // Validate required fields
    if (!title || !description || !price || !category) {
      return res.status(400).json({ 
        msg: 'Missing required fields: title, description, price, category are required' 
      });
    }

    // Parse features if sent as string
    let parsedFeatures = [];
    if (features) {
      try {
        parsedFeatures = typeof features === 'string' ? JSON.parse(features) : features;
      } catch (e) {
        console.error('Error parsing features:', e);
        parsedFeatures = [];
      }
    }

    // Parse tags if sent as string
    let parsedTags = [];
    if (tags) {
      parsedTags = typeof tags === 'string' ? tags.split(',').map(tag => tag.trim()) : tags;
    }

    // Parse boolean values
    const isAvailableBool = isAvailable === 'true' || isAvailable === true;
    const isPopularBool = isPopular === 'true' || isPopular === true;
    const isFeaturedBool = isFeatured === 'true' || isFeatured === true;

    // Create service instance
    const serviceData = {
      title,
      description,
      price,
      originalPrice: originalPrice || '',
      category,
      subCategory: subCategory || '',
      features: parsedFeatures,
      duration: duration || '',
      isAvailable: isAvailableBool,
      isPopular: isPopularBool,
      isFeatured: isFeaturedBool,
      tags: parsedTags,
      createdBy: req.user ? req.user.id : null,
    };

    console.log('Creating service with data:', serviceData);

    const service = new Service(serviceData);

    // Handle image uploads to Cloudinary
    if (req.files && req.files.length > 0) {
      const images = [];
      
      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        const imageBuffer = file.buffer;
        const imageMime = file.mimetype;

        if (!imageMime.startsWith('image/')) {
          return res.status(400).json({ msg: 'All files must be images' });
        }

        try {
          const imageDataUri = `data:${imageMime};base64,${imageBuffer.toString('base64')}`;
          
          const imageResult = await cloudinary.uploader.upload(imageDataUri, {
            folder: 'services',
            resource_type: 'image',
          });

          images.push({
            url: imageResult.secure_url,
            publicId: imageResult.public_id,
            isPrimary: i === 0,
          });

          console.log(`Image ${i + 1} uploaded:`, imageResult.secure_url);
        } catch (uploadError) {
          console.error('Image upload error:', uploadError);
          return res.status(500).json({ msg: 'Failed to upload image: ' + uploadError.message });
        }
      }

      service.images = images;
    }

    await service.save();

    return res.status(201).json({
      msg: 'Service created successfully',
      service,
    });
  } catch (err) {
    console.error('Create service error:', err);
    return res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// Get all services
const getServices = async (req, res) => {
  try {
    if (!Service) {
      return res.status(500).json({ msg: 'Service model not initialized' });
    }

    const { category, isPopular, isFeatured, limit, page = 1 } = req.query;
    
    let query = {};
    
    if (category) {
      query.category = category;
    }
    
    if (isPopular === 'true') {
      query.isPopular = true;
    }
    
    if (isFeatured === 'true') {
      query.isFeatured = true;
    }

    const pageSize = parseInt(limit) || 10;
    const skip = (parseInt(page) - 1) * pageSize;

    const services = await Service.find(query)
      .sort({ createdAt: -1 })
      .limit(pageSize)
      .skip(skip);

    const total = await Service.countDocuments(query);

    return res.json({
      services,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (err) {
    console.error('Get services error:', err);
    return res.status(500).json({ msg: 'Server error' });
  }
};

// Get service by ID
const getServiceById = async (req, res) => {
  try {
    if (!Service) {
      return res.status(500).json({ msg: 'Service model not initialized' });
    }

    const service = await Service.findById(req.params.id);
    
    if (!service) {
      return res.status(404).json({ msg: 'Service not found' });
    }

    return res.json(service);
  } catch (err) {
    console.error('Get service error:', err);
    return res.status(500).json({ msg: 'Server error' });
  }
};

// Get services by category
const getServicesByCategory = async (req, res) => {
  try {
    if (!Service) {
      return res.status(500).json({ msg: 'Service model not initialized' });
    }

    const { category } = req.params;
    
    const services = await Service.find({ 
      category,
      isAvailable: true 
    }).sort({ isPopular: -1, createdAt: -1 });

    return res.json(services);
  } catch (err) {
    console.error('Get services by category error:', err);
    return res.status(500).json({ msg: 'Server error' });
  }
};

// Update service
const updateService = async (req, res) => {
  try {
    if (!Service) {
      return res.status(500).json({ msg: 'Service model not initialized' });
    }

    const service = await Service.findById(req.params.id);
    
    if (!service) {
      return res.status(404).json({ msg: 'Service not found' });
    }

    const {
      title,
      description,
      price,
      originalPrice,
      category,
      subCategory,
      features,
      duration,
      isAvailable,
      isPopular,
      isFeatured,
      tags,
    } = req.body;

    // Update fields
    if (title) service.title = title;
    if (description) service.description = description;
    if (price) service.price = price;
    if (originalPrice) service.originalPrice = originalPrice;
    if (category) service.category = category;
    if (subCategory) service.subCategory = subCategory;
    if (duration) service.duration = duration;
    if (isAvailable !== undefined) service.isAvailable = isAvailable === 'true' || isAvailable === true;
    if (isPopular !== undefined) service.isPopular = isPopular === 'true' || isPopular === true;
    if (isFeatured !== undefined) service.isFeatured = isFeatured === 'true' || isFeatured === true;
    
    // Parse features if sent as string
    if (features) {
      try {
        service.features = typeof features === 'string' ? JSON.parse(features) : features;
      } catch (e) {
        service.features = [];
      }
    }
    
    // Parse tags if sent as string
    if (tags) {
      service.tags = typeof tags === 'string' ? tags.split(',').map(tag => tag.trim()) : tags;
    }

    // Handle new image uploads
    if (req.files && req.files.length > 0) {
      // Delete old images from Cloudinary
      for (const image of service.images) {
        if (image.publicId) {
          try {
            await cloudinary.uploader.destroy(image.publicId);
          } catch (error) {
            console.error('Error deleting old image:', error);
          }
        }
      }

      // Upload new images
      const images = [];
      
      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        const imageBuffer = file.buffer;
        const imageMime = file.mimetype;

        if (!imageMime.startsWith('image/')) {
          return res.status(400).json({ msg: 'All files must be images' });
        }

        try {
          const imageDataUri = `data:${imageMime};base64,${imageBuffer.toString('base64')}`;
          
          const imageResult = await cloudinary.uploader.upload(imageDataUri, {
            folder: 'services',
            resource_type: 'image',
          });

          images.push({
            url: imageResult.secure_url,
            publicId: imageResult.public_id,
            isPrimary: i === 0,
          });
        } catch (uploadError) {
          console.error('Image upload error:', uploadError);
          return res.status(500).json({ msg: 'Failed to upload image' });
        }
      }

      service.images = images;
    }

    await service.save();

    return res.json({
      msg: 'Service updated successfully',
      service,
    });
  } catch (err) {
    console.error('Update service error:', err);
    return res.status(500).json({ msg: 'Server error' });
  }
};

// Delete service
const deleteService = async (req, res) => {
  try {
    if (!Service) {
      return res.status(500).json({ msg: 'Service model not initialized' });
    }

    const service = await Service.findById(req.params.id);
    
    if (!service) {
      return res.status(404).json({ msg: 'Service not found' });
    }

    // Delete images from Cloudinary
    for (const image of service.images) {
      if (image.publicId) {
        try {
          await cloudinary.uploader.destroy(image.publicId);
        } catch (error) {
          console.error('Error deleting image:', error);
        }
      }
    }

    await service.deleteOne();

    return res.json({ msg: 'Service deleted successfully' });
  } catch (err) {
    console.error('Delete service error:', err);
    return res.status(500).json({ msg: 'Server error' });
  }
};

// Create or update category
const createCategory = async (req, res) => {
  try {
    if (!Category) {
      return res.status(500).json({ msg: 'Category model not initialized' });
    }

    const {
      name,
      slug,
      description,
      icon,
      heroTitle,
      heroDescription,
      heroGradient,
      features,
      brands,
      testimonials,
      isActive,
      order,
    } = req.body;

    let category = await Category.findOne({ slug });

    if (category) {
      // Update existing category
      if (name) category.name = name;
      if (description) category.description = description;
      if (icon) category.icon = icon;
      if (heroTitle) category.heroTitle = heroTitle;
      if (heroDescription) category.heroDescription = heroDescription;
      if (heroGradient) {
        try {
          category.heroGradient = typeof heroGradient === 'string' ? JSON.parse(heroGradient) : heroGradient;
        } catch (e) {
          category.heroGradient = { from: '#dc2626', to: '#b91c1c' };
        }
      }
      if (features) {
        try {
          category.features = typeof features === 'string' ? JSON.parse(features) : features;
        } catch (e) {
          category.features = [];
        }
      }
      if (brands) {
        category.brands = typeof brands === 'string' ? brands.split(',').map(b => b.trim()) : brands;
      }
      if (testimonials) {
        try {
          category.testimonials = typeof testimonials === 'string' ? JSON.parse(testimonials) : testimonials;
        } catch (e) {
          category.testimonials = [];
        }
      }
      if (isActive !== undefined) category.isActive = isActive === 'true' || isActive === true;
      if (order) category.order = parseInt(order);
    } else {
      // Create new category
      category = new Category({
        name,
        slug,
        description,
        icon,
        heroTitle,
        heroDescription,
        heroGradient: heroGradient || { from: '#dc2626', to: '#b91c1c' },
        features: features || [],
        brands: brands || [],
        testimonials: testimonials || [],
        isActive: isActive !== undefined ? (isActive === 'true' || isActive === true) : true,
        order: order ? parseInt(order) : 0,
      });
    }

    // Handle category image upload
    if (req.file) {
      const imageBuffer = req.file.buffer;
      const imageMime = req.file.mimetype;

      if (!imageMime.startsWith('image/')) {
        return res.status(400).json({ msg: 'File must be an image' });
      }

      try {
        if (category.image && category.image.publicId) {
          await cloudinary.uploader.destroy(category.image.publicId);
        }

        const imageDataUri = `data:${imageMime};base64,${imageBuffer.toString('base64')}`;
        
        const imageResult = await cloudinary.uploader.upload(imageDataUri, {
          folder: 'categories',
          resource_type: 'image',
        });

        category.image = {
          url: imageResult.secure_url,
          publicId: imageResult.public_id,
        };
      } catch (uploadError) {
        console.error('Category image upload error:', uploadError);
        return res.status(500).json({ msg: 'Failed to upload category image' });
      }
    }

    await category.save();

    return res.json({
      msg: category.isNew ? 'Category created successfully' : 'Category updated successfully',
      category,
    });
  } catch (err) {
    console.error('Create/update category error:', err);
    return res.status(500).json({ msg: 'Server error' });
  }
};

// Get all categories
const getCategories = async (req, res) => {
  try {
    if (!Category) {
      return res.status(500).json({ msg: 'Category model not initialized' });
    }

    const categories = await Category.find({ isActive: true })
      .sort({ order: 1, name: 1 });

    return res.json(categories);
  } catch (err) {
    console.error('Get categories error:', err);
    return res.status(500).json({ msg: 'Server error' });
  }
};

// Get category by slug
const getCategoryBySlug = async (req, res) => {
  try {
    if (!Category || !Service) {
      return res.status(500).json({ msg: 'Models not initialized' });
    }

    const category = await Category.findOne({ 
      slug: req.params.slug,
      isActive: true 
    });

    if (!category) {
      return res.status(404).json({ msg: 'Category not found' });
    }

    // Get services for this category
    const services = await Service.find({ 
      category: category.slug,
      isAvailable: true 
    }).sort({ isPopular: -1, createdAt: -1 });

    return res.json({
      category,
      services,
    });
  } catch (err) {
    console.error('Get category error:', err);
    return res.status(500).json({ msg: 'Server error' });
  }
};

module.exports = {
  createService,
  getServices,
  getServiceById,
  getServicesByCategory,
  updateService,
  deleteService,
  createCategory,
  getCategories,
  getCategoryBySlug,
};