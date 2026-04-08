const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const Property = require('../models/Property');
const connectDB = require('../config/db');

const properties = [
  {
    title: '3BHK Luxury Apartment in Gachibowli',
    description:
      'Spacious 3BHK apartment in the heart of Gachibowli IT corridor. Premium finishes, modular kitchen, and stunning city views. Close to major tech parks like DLF and Google campus. Society amenities include Olympic-size pool, gym, and 24/7 security.',
    price: 8500000,
    priceLabel: '₹85 Lakhs',
    location: 'Gachibowli',
    city: 'Hyderabad',
    type: 'Apartment',
    status: 'For Sale',
    bedrooms: 3,
    bathrooms: 3,
    area: 1850,
    floor: 12,
    totalFloors: 25,
    parking: true,
    furnished: 'Semi-Furnished',
    amenities: ['Swimming Pool', 'Gymnasium', '24/7 Security', 'Power Backup', 'Children Play Area', 'Clubhouse'],
    images: [
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800',
    ],
    listedBy: 'PropConnect Agency',
    contactPhone: '+91 9876543210',
    yearBuilt: 2021,
    isFeatured: true,
  },
  {
    title: 'Modern 4BHK Villa in Jubilee Hills',
    description:
      'Exquisite 4BHK independent villa in premium Jubilee Hills locality. Features a private garden, rooftop terrace, designer interiors, and a home theatre. Walking distance to Road No. 36 restaurants and Film Nagar. A lifestyle address for the discerning buyer.',
    price: 32000000,
    priceLabel: '₹3.2 Cr',
    location: 'Jubilee Hills',
    city: 'Hyderabad',
    type: 'Villa',
    status: 'For Sale',
    bedrooms: 4,
    bathrooms: 4,
    area: 3800,
    floor: 0,
    totalFloors: 2,
    parking: true,
    furnished: 'Furnished',
    amenities: ['Private Garden', 'Rooftop Terrace', 'Home Theatre', 'Modular Kitchen', 'Smart Home', '2-car Garage'],
    images: [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
    ],
    listedBy: 'Elite Realtors Hyderabad',
    contactPhone: '+91 9866123456',
    yearBuilt: 2022,
    isFeatured: true,
  },
  {
    title: '2BHK Apartment in Hitech City',
    description:
      'Well-maintained 2BHK apartment near Hitech City metro station. Ideal for IT professionals working in Cyberabad. Vastu-compliant layout, dedicated parking, and excellent connectivity via ORR. Society has 100% power backup and water supply.',
    price: 5500000,
    priceLabel: '₹55 Lakhs',
    location: 'Hitech City',
    city: 'Hyderabad',
    type: 'Apartment',
    status: 'For Sale',
    bedrooms: 2,
    bathrooms: 2,
    area: 1200,
    floor: 5,
    totalFloors: 14,
    parking: true,
    furnished: 'Unfurnished',
    amenities: ['Power Backup', 'Covered Parking', 'CCTV Surveillance', 'Intercom', 'Rain Water Harvesting'],
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
    ],
    listedBy: 'PropConnect Agency',
    contactPhone: '+91 9876543210',
    yearBuilt: 2019,
    isFeatured: false,
  },
  {
    title: '3BHK Independent House in Banjara Hills',
    description:
      'Charming 3BHK independent house in Banjara Hills Road No. 12. Renovated interiors, large compound with garden space, and two-car parking. Prime location with easy access to Peddamma Temple, GVK One Mall, and top schools.',
    price: 18500000,
    priceLabel: '₹1.85 Cr',
    location: 'Banjara Hills',
    city: 'Hyderabad',
    type: 'Independent House',
    status: 'For Sale',
    bedrooms: 3,
    bathrooms: 3,
    area: 2400,
    floor: 0,
    totalFloors: 2,
    parking: true,
    furnished: 'Semi-Furnished',
    amenities: ['Garden', 'Two-car Parking', 'Solar Water Heater', 'Servant Quarters', 'Bore Well'],
    images: [
      'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800',
      'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800',
    ],
    listedBy: 'Banjara Properties',
    contactPhone: '+91 9988776655',
    yearBuilt: 2015,
    isFeatured: false,
  },
  {
    title: '2BHK Apartment for Rent in Madhapur',
    description:
      'Fully furnished 2BHK apartment available for rent in Madhapur, seconds from Mindspace IT Park. Includes all appliances, AC in every room, and high-speed fiber internet. Ideal for working professionals or small families. No broker fee.',
    price: 35000,
    priceLabel: '₹35,000/month',
    location: 'Madhapur',
    city: 'Hyderabad',
    type: 'Apartment',
    status: 'For Rent',
    bedrooms: 2,
    bathrooms: 2,
    area: 1100,
    floor: 3,
    totalFloors: 8,
    parking: true,
    furnished: 'Furnished',
    amenities: ['Fully Equipped Kitchen', 'AC in all rooms', 'High-speed Internet', 'Washing Machine', 'Covered Parking'],
    images: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
      'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800',
    ],
    listedBy: 'PropConnect Agency',
    contactPhone: '+91 9876543210',
    yearBuilt: 2020,
    isFeatured: false,
  },
  {
    title: '3BHK Premium Apartment in Kondapur',
    description:
      'Newly launched 3BHK luxury apartment in Kondapur. Features imported marble flooring, modular wardrobes, and a large balcony with greenery views. The gated community offers a clubhouse, jogging track, and kids zone. Near Gachibowli flyover.',
    price: 9500000,
    priceLabel: '₹95 Lakhs',
    location: 'Kondapur',
    city: 'Hyderabad',
    type: 'Apartment',
    status: 'For Sale',
    bedrooms: 3,
    bathrooms: 3,
    area: 1950,
    floor: 8,
    totalFloors: 18,
    parking: true,
    furnished: 'Unfurnished',
    amenities: ['Clubhouse', 'Jogging Track', 'Kids Zone', 'Swimming Pool', 'Power Backup', 'Gym'],
    images: [
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800',
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800',
    ],
    listedBy: 'Skyline Realty',
    contactPhone: '+91 9900112233',
    yearBuilt: 2023,
    isFeatured: true,
  },
  {
    title: '5BHK Farmhouse Villa in Shamshabad',
    description:
      'Sprawling 5BHK farmhouse villa near Shamshabad on the outskirts of Hyderabad. Set on 1 acre of private land with a swimming pool, orchard, and outdoor barbecue area. Peaceful retreat with all modern amenities and easy access to RGIA international airport.',
    price: 55000000,
    priceLabel: '₹5.5 Cr',
    location: 'Shamshabad',
    city: 'Hyderabad',
    type: 'Villa',
    status: 'For Sale',
    bedrooms: 5,
    bathrooms: 5,
    area: 6200,
    floor: 0,
    totalFloors: 2,
    parking: true,
    furnished: 'Furnished',
    amenities: ['Private Pool', 'Orchard', 'Outdoor BBQ', 'Home Theatre', '5-car Garage', 'Staff Quarters', 'Solar Power'],
    images: [
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
    ],
    listedBy: 'Luxury Estates Hyderabad',
    contactPhone: '+91 8800990011',
    yearBuilt: 2022,
    isFeatured: false,
  },
  {
    title: '2BHK Apartment in Kukatpally',
    description:
      'Affordable 2BHK apartment in the bustling Kukatpally area. Strategically located near KPHB colony and Kukatpally metro station. Good connectivity to Financial District and BHEL. Suitable for first-time home buyers. Vastu-compliant with east-facing main door.',
    price: 4200000,
    priceLabel: '₹42 Lakhs',
    location: 'Kukatpally',
    city: 'Hyderabad',
    type: 'Apartment',
    status: 'For Sale',
    bedrooms: 2,
    bathrooms: 2,
    area: 1050,
    floor: 2,
    totalFloors: 6,
    parking: true,
    furnished: 'Unfurnished',
    amenities: ['Lift', 'Power Backup', 'Covered Parking', 'Security', 'Water Supply'],
    images: [
      'https://images.unsplash.com/photo-1617104678098-de229db51175?w=800',
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800',
    ],
    listedBy: 'PropConnect Agency',
    contactPhone: '+91 9876543210',
    yearBuilt: 2017,
    isFeatured: false,
  },
  {
    title: '4BHK Luxe Apartment in Begumpet',
    description:
      'Ultra-luxurious 4BHK apartment in prime Begumpet locality. Walking distance to Hyderabad airport road and Secunderabad railway station. Double-height living room, imported Italian flooring, and a wrap-around balcony with panoramic city views. Concierge services included.',
    price: 22000000,
    priceLabel: '₹2.2 Cr',
    location: 'Begumpet',
    city: 'Hyderabad',
    type: 'Apartment',
    status: 'For Sale',
    bedrooms: 4,
    bathrooms: 4,
    area: 3200,
    floor: 15,
    totalFloors: 22,
    parking: true,
    furnished: 'Furnished',
    amenities: ['Concierge', 'Rooftop Infinity Pool', 'Gym', 'Business Lounge', 'Valet Parking', 'Spa'],
    images: [
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800',
      'https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4?w=800',
    ],
    listedBy: 'Premium Homes Hyderabad',
    contactPhone: '+91 9111222333',
    yearBuilt: 2023,
    isFeatured: true,
  },
  {
    title: '3BHK Apartment in Manikonda',
    description:
      'Beautifully designed 3BHK apartment in the rapidly growing Manikonda locality. Close to Financial District and accessible via ORR. The project boasts a landscaped podium garden, amphitheatre, and multipurpose hall. Great investment opportunity with solid rental yields.',
    price: 7200000,
    priceLabel: '₹72 Lakhs',
    location: 'Manikonda',
    city: 'Hyderabad',
    type: 'Apartment',
    status: 'For Sale',
    bedrooms: 3,
    bathrooms: 2,
    area: 1600,
    floor: 6,
    totalFloors: 12,
    parking: true,
    furnished: 'Semi-Furnished',
    amenities: ['Podium Garden', 'Amphitheatre', 'Multipurpose Hall', 'Gym', 'Kids Pool', 'CCTV'],
    images: [
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800',
      'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800',
    ],
    listedBy: 'GreenCity Realtors',
    contactPhone: '+91 9443556677',
    yearBuilt: 2021,
    isFeatured: false,
  },
];

const seedDatabase = async () => {
  await connectDB();

  try {
    await Property.deleteMany({});
    console.log('🗑️  Cleared existing properties');

    const created = await Property.insertMany(properties);
    console.log(`✅ Seeded ${created.length} properties successfully!`);
    console.log('\nProperties seeded:');
    created.forEach((p, i) => {
      console.log(`  ${i + 1}. [${p._id}] ${p.title} — ${p.priceLabel} @ ${p.location}`);
    });
  } catch (error) {
    console.error('❌ Seeding error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 MongoDB connection closed.');
    process.exit(0);
  }
};

seedDatabase();
