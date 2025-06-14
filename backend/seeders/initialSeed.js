const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/database');
const {
  Admin,
  Instructor,
  Trainee,
  Project,
  ProjectProgress,
  Document,
  Notification,
} = require('../models');

// Utility function to hash passwords
const hashPassword = async (password) => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Force sync to recreate tables (use with caution in production)
    await sequelize.sync({ force: false });

    // Create Admin Users
    console.log('👑 Creating admin users...');
    
    const admin1 = await Admin.create({
      name: 'System Administrator',
      email: 'admin@nhpc.com',
      phone: '9876543210',
      title: 'System Administrator',
      department: 'IT Department',
      password: await hashPassword('admin123'),
      is_active: true,
    });

    const admin2 = await Admin.create({
      name: 'Training Head',
      email: 'training.head@nhpc.com',
      phone: '9876543211',
      title: 'Head of Training',
      department: 'Training Department',
      password: await hashPassword('training123'),
      is_active: true,
      created_by: admin1.id,
    });

    const admin3 = await Admin.create({
      name: 'HR Manager',
      email: 'hr.manager@nhpc.com',
      phone: '9876543212',
      title: 'HR Manager',
      department: 'Human Resources',
      password: await hashPassword('hr123'),
      is_active: true,
      created_by: admin1.id,
    });

    console.log('✅ Admin users created successfully');

    // Create Instructor Users
    console.log('👨‍🏫 Creating instructor users...');

    const instructor1 = await Instructor.create({
      name: 'Dr. Rajesh Kumar',
      email: 'rajesh.kumar@nhpc.com',
      phone: '9876543220',
      department: 'Electrical Engineering',
      role: 'Senior Technical Officer',
      specialization: 'Power Systems and Grid Integration',
      password: await hashPassword('instructor123'),
      is_active: true,
      created_by: admin1.id,
    });

    const instructor2 = await Instructor.create({
      name: 'Ms. Priya Sharma',
      email: 'priya.sharma@nhpc.com',
      phone: '9876543221',
      department: 'Mechanical Engineering',
      role: 'Technical Officer',
      specialization: 'Turbine Design and Maintenance',
      password: await hashPassword('instructor123'),
      is_active: true,
      created_by: admin1.id,
    });

    const instructor3 = await Instructor.create({
      name: 'Mr. Amit Singh',
      email: 'amit.singh@nhpc.com',
      phone: '9876543222',
      department: 'Civil Engineering',
      role: 'Assistant Manager',
      specialization: 'Dam Construction and Safety',
      password: await hashPassword('instructor123'),
      is_active: true,
      created_by: admin2.id,
    });

    const instructor4 = await Instructor.create({
      name: 'Dr. Sunita Gupta',
      email: 'sunita.gupta@nhpc.com',
      phone: '9876543223',
      department: 'Environmental Engineering',
      role: 'Senior Technical Officer',
      specialization: 'Environmental Impact Assessment',
      password: await hashPassword('instructor123'),
      is_active: true,
      created_by: admin2.id,
    });

    console.log('✅ Instructor users created successfully');

    // Create Sample Trainees
    console.log('👨‍🎓 Creating sample trainees...');

    const trainee1 = await Trainee.create({
      name: 'Arjun Patel',
      email: 'arjun.patel@student.edu',
      phone: '9876543230',
      institution: 'Indian Institute of Technology, Delhi',
      course: 'B.Tech Electrical Engineering',
      year_of_study: 3,
      address: '123 Student Hostel, IIT Delhi, New Delhi - 110016',
      emergency_contact: '9876543231',
      guardian_name: 'Ramesh Patel',
      guardian_phone: '9876543232',
      guardian_relation: 'Father',
      reference_name: 'Prof. Vikram Shah',
      reference_phone: '9876543233',
      reference_designation: 'Professor, Electrical Engineering',
      status: 'approved',
      joining_date: new Date('2025-01-15'),
      instructor_id: instructor1.id,
      approved_by: admin1.id,
      approval_comments: 'Excellent academic record. Approved for training.',
    });

    const trainee2 = await Trainee.create({
      name: 'Sneha Reddy',
      email: 'sneha.reddy@student.edu',
      phone: '9876543240',
      institution: 'National Institute of Technology, Warangal',
      course: 'B.Tech Mechanical Engineering',
      year_of_study: 4,
      address: '456 Girls Hostel, NIT Warangal, Telangana - 506004',
      emergency_contact: '9876543241',
      guardian_name: 'Srinivas Reddy',
      guardian_phone: '9876543242',
      guardian_relation: 'Father',
      reference_name: 'Dr. Lakshmi Narayana',
      reference_phone: '9876543243',
      reference_designation: 'Associate Professor, Mechanical Engineering',
      status: 'approved',
      joining_date: new Date('2025-01-20'),
      instructor_id: instructor2.id,
      approved_by: admin1.id,
      approval_comments: 'Strong background in thermodynamics. Approved.',
    });

    const trainee3 = await Trainee.create({
      name: 'Karan Mehta',
      email: 'karan.mehta@student.edu',
      phone: '9876543250',
      institution: 'Birla Institute of Technology and Science, Pilani',
      course: 'B.Tech Civil Engineering',
      year_of_study: 3,
      address: '789 Boys Hostel, BITS Pilani, Rajasthan - 333031',
      emergency_contact: '9876543251',
      guardian_name: 'Suresh Mehta',
      guardian_phone: '9876543252',
      guardian_relation: 'Father',
      reference_name: 'Prof. Anand Joshi',
      reference_phone: '9876543253',
      reference_designation: 'Head of Department, Civil Engineering',
      status: 'approved',
      joining_date: new Date('2025-02-01'),
      instructor_id: instructor3.id,
      approved_by: admin2.id,
      approval_comments: 'Good knowledge of structural engineering. Approved.',
    });

    const trainee4 = await Trainee.create({
      name: 'Divya Nair',
      email: 'divya.nair@student.edu',
      phone: '9876543260',
      institution: 'Anna University, Chennai',
      course: 'M.Tech Environmental Engineering',
      year_of_study: 1,
      address: '101 PG Hostel, Anna University, Chennai - 600025',
      emergency_contact: '9876543261',
      guardian_name: 'Ravi Nair',
      guardian_phone: '9876543262',
      guardian_relation: 'Father',
      reference_name: 'Dr. Kamala Krishnan',
      reference_phone: '9876543263',
      reference_designation: 'Professor, Environmental Engineering',
      status: 'approved',
      joining_date: new Date('2025-02-15'),
      instructor_id: instructor4.id,
      approved_by: admin2.id,
      approval_comments: 'Research background in water treatment. Approved.',
    });

    // Create pending trainees for testing approval workflow
    const trainee5 = await Trainee.create({
      name: 'Rohit Sharma',
      email: 'rohit.sharma@student.edu',
      phone: '9876543270',
      institution: 'Jadavpur University, Kolkata',
      course: 'B.Tech Electrical Engineering',
      year_of_study: 4,
      address: '202 Student Quarters, Jadavpur University, Kolkata - 700032',
      emergency_contact: '9876543271',
      guardian_name: 'Manoj Sharma',
      guardian_phone: '9876543272',
      guardian_relation: 'Father',
      reference_name: 'Prof. Debasis Roy',
      reference_phone: '9876543273',
      reference_designation: 'Associate Professor, Electrical Engineering',
      status: 'pending',
      instructor_id: instructor1.id,
    });

    const trainee6 = await Trainee.create({
      name: 'Ananya Das',
      email: 'ananya.das@student.edu',
      phone: '9876543280',
      institution: 'Delhi Technological University',
      course: 'B.Tech Mechanical Engineering',
      year_of_study: 3,
      address: '303 Girls Hostel, DTU, New Delhi - 110042',
      emergency_contact: '9876543281',
      guardian_name: 'Ashok Das',
      guardian_phone: '9876543282',
      guardian_relation: 'Father',
      reference_name: 'Dr. Ritu Gupta',
      reference_phone: '9876543283',
      reference_designation: 'Assistant Professor, Mechanical Engineering',
      status: 'pending',
      instructor_id: instructor2.id,
    });

    console.log('✅ Sample trainees created successfully');

    // Create Sample Projects
    console.log('📋 Creating sample projects...');

    const project1 = await Project.create({
      title: 'Smart Grid Integration Analysis',
      description: 'Comprehensive analysis of smart grid integration technologies for hydroelectric power systems. This project involves studying advanced metering infrastructure, demand response systems, and grid stability mechanisms.',
      expected_duration_days: 90,
      status: 'in_progress',
      start_date: new Date('2025-01-15'),
      trainee_id: trainee1.id,
      instructor_id: instructor1.id,
    });

    const project2 = await Project.create({
      title: 'Turbine Efficiency Optimization Study',
      description: 'Research project focused on optimizing turbine efficiency through advanced blade design and computational fluid dynamics analysis.',
      expected_duration_days: 120,
      status: 'assigned',
      start_date: new Date('2025-01-20'),
      trainee_id: trainee2.id,
      instructor_id: instructor2.id,
    });

    const project3 = await Project.create({
      title: 'Dam Safety Inspection Procedures',
      description: 'Development of comprehensive dam safety inspection procedures including structural integrity assessment and risk analysis methodologies.',
      expected_duration_days: 75,
      status: 'assigned',
      start_date: new Date('2025-02-01'),
      trainee_id: trainee3.id,
      instructor_id: instructor3.id,
    });

    const project4 = await Project.create({
      title: 'Environmental Impact Assessment Framework',
      description: 'Creating a standardized framework for environmental impact assessment of hydroelectric projects with focus on aquatic ecosystem preservation.',
      expected_duration_days: 100,
      status: 'in_progress',
      start_date: new Date('2025-02-15'),
      trainee_id: trainee4.id,
      instructor_id: instructor4.id,
    });

    // Create completed project for demonstration
    const project5 = await Project.create({
      title: 'Power System Protection Analysis',
      description: 'Comprehensive study of power system protection schemes for hydroelectric installations.',
      expected_duration_days: 60,
      status: 'completed',
      start_date: new Date('2024-12-01'),
      end_date: new Date('2025-01-30'),
      performance_rating: 8.5,
      trainee_id: trainee1.id,
      instructor_id: instructor1.id,
      completion_email_sent: true,
    });

    console.log('✅ Sample projects created successfully');

    // Create Project Progress Records
    console.log('📊 Creating project progress records...');

    await ProjectProgress.create({
      project_id: project1.id,
      progress_date: new Date('2025-01-20'),
      progress_description: 'Completed literature review on smart grid technologies and identified key integration challenges.',
      percentage_completed: 25,
      instructor_id: instructor1.id,
    });

    await ProjectProgress.create({
      project_id: project1.id,
      progress_date: new Date('2025-02-01'),
      progress_description: 'Finished data collection from existing NHPC installations and began preliminary analysis.',
      percentage_completed: 50,
      instructor_id: instructor1.id,
    });

    await ProjectProgress.create({
      project_id: project4.id,
      progress_date: new Date('2025-02-20'),
      progress_description: 'Completed baseline environmental studies and initiated stakeholder consultation process.',
      percentage_completed: 30,
      instructor_id: instructor4.id,
    });

    console.log('✅ Project progress records created successfully');

    // Create Sample Notifications
    console.log('🔔 Creating sample notifications...');

    await Notification.create({
      type: 'trainee_creation_request',
      title: 'New Trainee Registration',
      message: 'Rohit Sharma has been registered by Dr. Rajesh Kumar and is pending approval',
      recipient_id: admin1.id,
      recipient_type: 'admin',
      related_id: trainee5.id,
      related_type: 'trainee',
    });

    await Notification.create({
      type: 'trainee_creation_request',
      title: 'New Trainee Registration',
      message: 'Ananya Das has been registered by Ms. Priya Sharma and is pending approval',
      recipient_id: admin1.id,
      recipient_type: 'admin',
      related_id: trainee6.id,
      related_type: 'trainee',
    });

    await Notification.create({
      type: 'project_completion',
      title: 'Project Completed',
      message: 'Power System Protection Analysis project has been completed successfully',
      recipient_id: instructor1.id,
      recipient_type: 'instructor',
      related_id: project5.id,
      related_type: 'project',
    });

    await Notification.create({
      type: 'monthly_upload_reminder',
      title: 'Monthly Attendance Upload Reminder',
      message: 'Please upload monthly attendance documents for your trainees',
      recipient_id: instructor1.id,
      recipient_type: 'instructor',
    });

    await Notification.create({
      type: 'system_announcement',
      title: 'System Maintenance Scheduled',
      message: 'System maintenance is scheduled for this weekend. Please plan accordingly.',
      recipient_id: admin1.id,
      recipient_type: 'admin',
    });

    console.log('✅ Sample notifications created successfully');

    console.log('');
    console.log('🎉 Database seeding completed successfully!');
    console.log('');
    console.log('📊 Created Records Summary:');
    console.log(`   👑 Admins: 3`);
    console.log(`   👨‍🏫 Instructors: 4`);
    console.log(`   👨‍🎓 Trainees: 6 (4 approved, 2 pending)`);
    console.log(`   📋 Projects: 5 (2 in progress, 2 assigned, 1 completed)`);
    console.log(`   📊 Progress Records: 3`);
    console.log(`   🔔 Notifications: 5`);
    console.log('');
    console.log('🔐 Login Credentials:');
    console.log('');
    console.log('   👑 ADMIN ACCOUNTS:');
    console.log('   ==================');
    console.log('   Email: admin@nhpc.com');
    console.log('   Password: admin123');
    console.log('   Role: System Administrator');
    console.log('');
    console.log('   Email: training.head@nhpc.com');
    console.log('   Password: training123');
    console.log('   Role: Head of Training');
    console.log('');
    console.log('   Email: hr.manager@nhpc.com');
    console.log('   Password: hr123');
    console.log('   Role: HR Manager');
    console.log('');
    console.log('   👨‍🏫 INSTRUCTOR ACCOUNTS:');
    console.log('   ========================');
    console.log('   Email: rajesh.kumar@nhpc.com');
    console.log('   Password: instructor123');
    console.log('   Department: Electrical Engineering');
    console.log('');
    console.log('   Email: priya.sharma@nhpc.com');
    console.log('   Password: instructor123');
    console.log('   Department: Mechanical Engineering');
    console.log('');
    console.log('   Email: amit.singh@nhpc.com');
    console.log('   Password: instructor123');
    console.log('   Department: Civil Engineering');
    console.log('');
    console.log('   Email: sunita.gupta@nhpc.com');
    console.log('   Password: instructor123');
    console.log('   Department: Environmental Engineering');
    console.log('');
    console.log('✨ You can now test the application with these credentials!');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    // Close database connection
    await sequelize.close();
    process.exit(0);
  }
};

// Run the seed function
seedDatabase();
