import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clean existing data
  await prisma.review.deleteMany();
  await prisma.bookingStatusHistory.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.providerRecommendation.deleteMany();
  await prisma.providerScore.deleteMany();
  await prisma.serviceRequest.deleteMany();
  await prisma.emergencyRequest.deleteMany();
  await prisma.aIAnalysis.deleteMany();
  await prisma.mediaFile.deleteMany();
  await prisma.maintenanceReminder.deleteMany();
  await prisma.maintenanceRecord.deleteMany();
  await prisma.appliance.deleteMany();
  await prisma.providerLocation.deleteMany();
  await prisma.providerAvailability.deleteMany();
  await prisma.providerSkill.deleteMany();
  await prisma.providerService.deleteMany();
  await prisma.serviceCategory.deleteMany();
  await prisma.customerProfile.deleteMany();
  await prisma.providerProfile.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('password123', 10);

  // 1. Create Admin User
  await prisma.user.create({
    data: {
      email: 'admin@smartlocal.com',
      passwordHash,
      name: 'System Admin',
      role: 'ADMIN',
      phone: '+91 9876543210',
    },
  });

  // 2. Create Customers
  const customer1 = await prisma.user.create({
    data: {
      email: 'customer@example.com',
      passwordHash,
      name: 'Priya Sharma',
      role: 'CUSTOMER',
      phone: '+91 9123456789',
      customerProfile: {
        create: {
          defaultAddress: '123 MG Road, Indiranagar, Bangalore',
          latitude: 12.9716,
          longitude: 77.5946,
        },
      },
    },
  });

  await prisma.user.create({
    data: {
      email: 'rahul@example.com',
      passwordHash,
      name: 'Rahul Verma',
      role: 'CUSTOMER',
      phone: '+91 9876501234',
      customerProfile: {
        create: {
          defaultAddress: '456 Koramangala 5th Block, Bangalore',
          latitude: 12.9352,
          longitude: 77.6245,
        },
      },
    },
  });

  // 3. Create Service Categories
  const catAC = await prisma.serviceCategory.create({
    data: { name: 'AC Technician', slug: 'ac-technician', description: 'AC Repair, Servicing & Gas Charging', icon: 'air-conditioner' }
  });
  const catWM = await prisma.serviceCategory.create({
    data: { name: 'Washing Machine Technician', slug: 'washing-machine-technician', description: 'Front & Top Load Washing Machine Repair', icon: 'washing-machine' }
  });
  const catRef = await prisma.serviceCategory.create({
    data: { name: 'Refrigerator Technician', slug: 'refrigerator-technician', description: 'Single & Double Door Fridge Repair', icon: 'refrigerator' }
  });
  await prisma.serviceCategory.create({
    data: { name: 'Electrician', slug: 'electrician', description: 'Wiring, Short Circuit & Appliance Installation', icon: 'bolt' }
  });
  await prisma.serviceCategory.create({
    data: { name: 'Plumber', slug: 'plumber', description: 'Water Leakage, Pipe Repair & Tap Fitting', icon: 'faucet' }
  });
  const catBike = await prisma.serviceCategory.create({
    data: { name: 'Two-Wheeler Mechanic', slug: 'two-wheeler-mechanic', description: 'Bike & Scooter Breakdown Emergency & Service', icon: 'motorcycle' }
  });
  const catCar = await prisma.serviceCategory.create({
    data: { name: 'Car Mechanic', slug: 'car-mechanic', description: 'Car Engine, Battery Jumpstart & Breakdown Rescue', icon: 'car' }
  });

  // 4. Create Service Providers with realistic locations, ratings, and skills
  
  // Provider 1: Ravi Appliance Services (1.2 km away, Best Match for Washing Machine & AC)
  const p1User = await prisma.user.create({
    data: {
      email: 'ravi@appliances.com',
      passwordHash,
      name: 'Ravi Kumar',
      role: 'PROVIDER',
      phone: '+91 9988776655',
    }
  });

  const p1Profile = await prisma.providerProfile.create({
    data: {
      userId: p1User.id,
      businessName: 'Ravi Appliance Services',
      bio: 'Master technician with 10+ years experience in washing machines, ACs, and refrigerators.',
      experienceYears: 10,
      verificationStatus: 'VERIFIED',
      basePrice: 500,
      rating: 4.9,
      reviewCount: 142,
      jobsCompleted: 350,
      responseTimeMinutes: 10,
      serviceRadiusKm: 15.0,
      latitude: 12.9780, // ~1.2km from customer
      longitude: 77.5990,
      availableNow: true,
      providerServices: {
        create: [
          { serviceCategoryId: catWM.id, estimatedPriceMin: 500, estimatedPriceMax: 1200 },
          { serviceCategoryId: catAC.id, estimatedPriceMin: 600, estimatedPriceMax: 1500 },
          { serviceCategoryId: catRef.id, estimatedPriceMin: 450, estimatedPriceMax: 1000 },
        ]
      },
      skills: {
        create: [
          { skillName: 'Washing Machine Drainage Repair', expertiseLevel: 'Expert', applianceType: 'Washing Machine' },
          { skillName: 'AC Gas Refilling & Cleaning', expertiseLevel: 'Expert', applianceType: 'AC' },
          { skillName: 'Compressor Diagnostics', expertiseLevel: 'Advanced', applianceType: 'Refrigerator' },
        ]
      },
      availabilities: {
        create: [0, 1, 2, 3, 4, 5, 6].map(day => ({ dayOfWeek: day, startTime: '08:00', endTime: '21:00', isAvailable: true }))
      }
    }
  });

  // Provider 2: Kumar Repairs (2.4 km away, slightly cheaper)
  const p2User = await prisma.user.create({
    data: {
      email: 'kumar@repairs.com',
      passwordHash,
      name: 'Suresh Kumar',
      role: 'PROVIDER',
      phone: '+91 9876123456',
    }
  });

  await prisma.providerProfile.create({
    data: {
      userId: p2User.id,
      businessName: 'Kumar Repairs',
      bio: 'Fast and affordable repair services for all household appliances.',
      experienceYears: 6,
      verificationStatus: 'VERIFIED',
      basePrice: 400,
      rating: 4.7,
      reviewCount: 88,
      jobsCompleted: 190,
      responseTimeMinutes: 25,
      serviceRadiusKm: 12.0,
      latitude: 12.9850, // ~2.4km from customer
      longitude: 77.6080,
      availableNow: true,
      providerServices: {
        create: [
          { serviceCategoryId: catWM.id, estimatedPriceMin: 400, estimatedPriceMax: 900 },
          { serviceCategoryId: catRef.id, estimatedPriceMin: 400, estimatedPriceMax: 850 },
        ]
      },
      skills: {
        create: [
          { skillName: 'Washing Machine Motor Repair', expertiseLevel: 'Intermediate', applianceType: 'Washing Machine' },
          { skillName: 'Thermostat Replacement', expertiseLevel: 'Advanced', applianceType: 'Refrigerator' },
        ]
      },
      availabilities: {
        create: [0, 1, 2, 3, 4, 5, 6].map(day => ({ dayOfWeek: day, startTime: '09:00', endTime: '20:00', isAvailable: true }))
      }
    }
  });

  // Provider 3: AC Expert Services (1.4 km away, Top rated for AC Maintenance)
  const p3User = await prisma.user.create({
    data: {
      email: 'ac@experts.com',
      passwordHash,
      name: 'Anand Sharma',
      role: 'PROVIDER',
      phone: '+91 9765432109',
    }
  });

  await prisma.providerProfile.create({
    data: {
      userId: p3User.id,
      businessName: 'AC Expert Services',
      bio: 'Specialized in split, window & inverter AC maintenance, jet cleaning, and duct leak repair.',
      experienceYears: 12,
      verificationStatus: 'VERIFIED',
      basePrice: 500,
      rating: 4.9,
      reviewCount: 210,
      jobsCompleted: 520,
      responseTimeMinutes: 15,
      serviceRadiusKm: 20.0,
      latitude: 12.9750, // ~1.4km
      longitude: 77.6020,
      availableNow: true,
      providerServices: {
        create: [
          { serviceCategoryId: catAC.id, estimatedPriceMin: 500, estimatedPriceMax: 1800 },
        ]
      },
      skills: {
        create: [
          { skillName: 'Foam & Jet AC Cleaning', expertiseLevel: 'Expert', applianceType: 'AC' },
          { skillName: 'PCB Diagnostics & Repair', expertiseLevel: 'Expert', applianceType: 'AC' },
          { skillName: 'Copper Pipe Soldering', expertiseLevel: 'Advanced', applianceType: 'AC' },
        ]
      },
      availabilities: {
        create: [0, 1, 2, 3, 4, 5, 6].map(day => ({ dayOfWeek: day, startTime: '08:00', endTime: '22:00', isAvailable: true }))
      }
    }
  });

  // Provider 4: Rapid Bike Rescue (1.5 km away, Emergency Mechanics)
  const p4User = await prisma.user.create({
    data: {
      email: 'rescue@bikemechanic.com',
      passwordHash,
      name: 'Vikram Singh',
      role: 'PROVIDER',
      phone: '+91 9543210987',
    }
  });

  await prisma.providerProfile.create({
    data: {
      userId: p4User.id,
      businessName: 'Rapid Bike Rescue & Mechanics',
      bio: '24/7 emergency roadside motorcycle & scooter repair, battery jumpstart, clutch cable fix, and puncture rescue.',
      experienceYears: 8,
      verificationStatus: 'VERIFIED',
      basePrice: 350,
      rating: 4.8,
      reviewCount: 175,
      jobsCompleted: 410,
      responseTimeMinutes: 5, // Extremely fast ETA
      serviceRadiusKm: 25.0,
      latitude: 12.9760, // ~1.5km
      longitude: 77.5910,
      availableNow: true,
      providerServices: {
        create: [
          { serviceCategoryId: catBike.id, estimatedPriceMin: 300, estimatedPriceMax: 800 },
          { serviceCategoryId: catCar.id, estimatedPriceMin: 500, estimatedPriceMax: 1500 },
        ]
      },
      skills: {
        create: [
          { skillName: 'Battery Jumpstart & Spark Plug Fix', expertiseLevel: 'Expert', applianceType: 'Motorcycle' },
          { skillName: 'Clutch & Brake Cable Replacement', expertiseLevel: 'Expert', applianceType: 'Motorcycle' },
          { skillName: 'Emergency Fuel & Puncture Rescue', expertiseLevel: 'Expert', applianceType: 'Scooter' },
        ]
      },
      availabilities: {
        create: [0, 1, 2, 3, 4, 5, 6].map(day => ({ dayOfWeek: day, startTime: '00:00', endTime: '23:59', isAvailable: true }))
      }
    }
  });

  // Provider 5: City Auto Mechanic (6.5 km away - outside 5km radius for testing emergency expansion)
  const p5User = await prisma.user.create({
    data: {
      email: 'city@automechanic.com',
      passwordHash,
      name: 'Manoj Auto Care',
      role: 'PROVIDER',
      phone: '+91 9432109876',
    }
  });

  await prisma.providerProfile.create({
    data: {
      userId: p5User.id,
      businessName: 'City Auto Mechanic',
      bio: 'Car towing, engine repair, transmission & emergency breakdown rescue.',
      experienceYears: 15,
      verificationStatus: 'VERIFIED',
      basePrice: 600,
      rating: 4.9,
      reviewCount: 310,
      jobsCompleted: 780,
      responseTimeMinutes: 20,
      serviceRadiusKm: 30.0,
      latitude: 13.0200, // ~6.5km away
      longitude: 77.6300,
      availableNow: true,
      providerServices: {
        create: [
          { serviceCategoryId: catCar.id, estimatedPriceMin: 600, estimatedPriceMax: 3000 },
        ]
      },
      skills: {
        create: [
          { skillName: 'Car Engine Overhaul', expertiseLevel: 'Expert', applianceType: 'Car' },
          { skillName: 'Towing & Flatbed Service', expertiseLevel: 'Expert', applianceType: 'Car' },
        ]
      },
      availabilities: {
        create: [0, 1, 2, 3, 4, 5, 6].map(day => ({ dayOfWeek: day, startTime: '06:00', endTime: '23:00', isAvailable: true }))
      }
    }
  });

  // 5. Create Customer Appliances
  const app1 = await prisma.appliance.create({
    data: {
      customerId: customer1.id,
      name: 'Living Room Split AC',
      brand: 'LG',
      model: 'Dual Inverter 1.5 Ton',
      purchaseDate: '2024-03-15',
      installationDate: '2024-03-16',
      lastServiceDate: '2025-09-10', // Overdue for 6-month maintenance!
      maintenanceIntervalMonths: 6,
      warrantyInfo: 'Compressor 10 yrs, Unit 1 yr',
      notes: 'Make sure foam cleaning is used for indoor unit.',
    }
  });

  await prisma.appliance.create({
    data: {
      customerId: customer1.id,
      name: 'Main Washing Machine',
      brand: 'Whirlpool',
      model: 'Royal 7.5kg Fully Automatic',
      purchaseDate: '2023-11-20',
      installationDate: '2023-11-21',
      lastServiceDate: '2026-03-01',
      maintenanceIntervalMonths: 6,
      warrantyInfo: 'Motor warranty valid till 2028',
      notes: 'Check drain hose regularly.',
    }
  });

  // 6. Create Maintenance Reminders
  await prisma.maintenanceReminder.create({
    data: {
      applianceId: app1.id,
      dueDate: '2026-03-10',
      title: 'AC Maintenance Due',
      description: 'Your LG AC is due for regular filter cleaning, coil check, and gas level verification.',
      status: 'PENDING',
    }
  });

  // 7. Create a completed booking and review
  const booking1 = await prisma.booking.create({
    data: {
      customerId: customer1.id,
      providerId: p1Profile.id,
      serviceType: 'SMART_REPAIR',
      bookingDate: '2026-09-01',
      bookingTime: '10:00',
      status: 'COMPLETED',
      totalAmount: 750,
      notes: 'Washing machine drain pump replaced cleanly.',
    }
  });

  await prisma.review.create({
    data: {
      bookingId: booking1.id,
      customerId: customer1.id,
      providerId: p1Profile.id,
      rating: 5,
      comment: 'Ravi arrived in 15 minutes and fixed the drainage issue on my Whirlpool washing machine quickly. Highly recommended!',
    }
  });

  console.log('✅ Database seeding finished successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
