require('dotenv').config();
const { sequelize } = require('../config/database');
const { Admin, Instructor, Trainee, Project, ProjectProgress, Document, Notification } = require('../models');

const seedDatabase = async () => {
  try {
    console.log('Starting database seeding...');

    // Force sync the database (creates tables)
    await sequelize.sync({ force: true });
    console.log('Database synchronized successfully');

    // Create default admin
    const defaultAdmin = await Admin.create({
      name: 'Aastha Srivastava',
      email: process.env.DEFAULT_ADMIN_EMAIL || 'aasthasrivastava777@gmail.com',
      password: process.env.DEFAULT_ADMIN_PASSWORD || 'ja.nvi0125',
      phone: '9876543210',
      date_of_birth: '1990-01-15',
      title: 'System Administrator'
    });

    console.log('Default admin created:', defaultAdmin.email);    // Create sample instructors
    const instructors = await Instructor.bulkCreate([
      {
        name: 'Dr. Rajesh Kumar',
        email: 'rajesh.kumar@company.com',
        password: 'instructor123',
        phone: '9876543211',
        date_of_birth: '1985-03-20',
        department: 'Electrical Engineering',
        role: 'Senior Instructor',
        created_by: defaultAdmin.id
      },
      {
        name: 'Prof. Meera Sharma',
        email: 'meera.sharma@company.com',
        password: 'instructor456',
        phone: '9876543212',
        date_of_birth: '1980-07-10',
        department: 'Mechanical Engineering',
        role: 'Lead Instructor',
        created_by: defaultAdmin.id
      },
      {
        name: 'Dr. Amit Verma',
        email: 'amit.verma@company.com',
        password: 'instructor789',
        phone: '9876543213',
        date_of_birth: '1988-12-05',
        department: 'Civil Engineering',
        role: 'Instructor',
        created_by: defaultAdmin.id
      }
    ]);

    console.log(`Created ${instructors.length} sample instructors`);

    // Create sample trainees
    const trainees = await Trainee.bulkCreate([
      {
        name: 'Arjun Patel',
        institution_name: 'IIT Delhi',
        degree: 'B.Tech Electrical Engineering',
        mobile: '9123456789',
        joining_date: '2024-01-15',
        expected_completion_date: '2024-07-15',
        instructor_id: instructors[0].id,
        status: 'approved',
        local_guardian_name: 'Suresh Patel',
        local_guardian_phone: '9876543214',
        local_guardian_email: 'suresh.patel@gmail.com',
        reference_person_name: 'Dr. Vikram Singh',
        reference_person_phone: '9876543215',
        reference_person_email: 'vikram.singh@iitd.ac.in'
      },
      {
        name: 'Priya Sharma',
        institution_name: 'NIT Kurukshetra',
        degree: 'B.Tech Mechanical Engineering',
        mobile: '9123456790',
        joining_date: '2024-02-01',
        expected_completion_date: '2024-08-01',
        instructor_id: instructors[1].id,
        status: 'approved',
        local_guardian_name: 'Ravi Sharma',
        local_guardian_phone: '9876543216',
        local_guardian_email: 'ravi.sharma@gmail.com',
        reference_person_name: 'Prof. Anita Rani',
        reference_person_phone: '9876543217',
        reference_person_email: 'anita.rani@nitkkr.ac.in'
      },
      {
        name: 'Rohit Singh',
        institution_name: 'DTU Delhi',
        degree: 'B.Tech Civil Engineering',
        mobile: '9123456791',
        joining_date: '2024-03-01',
        expected_completion_date: '2024-09-01',
        instructor_id: instructors[2].id,
        status: 'pending_approval',
        local_guardian_name: 'Manoj Singh',
        local_guardian_phone: '9876543218',
        local_guardian_email: 'manoj.singh@gmail.com'
      },
      {
        name: 'Sneha Gupta',
        institution_name: 'NSIT Delhi',
        degree: 'B.Tech Electrical Engineering',
        mobile: '9123456792',
        joining_date: '2024-03-15',
        expected_completion_date: '2024-09-15',
        instructor_id: instructors[0].id,
        status: 'approved',
        local_guardian_name: 'Vinod Gupta',
        local_guardian_phone: '9876543219',
        local_guardian_email: 'vinod.gupta@gmail.com'
      }
    ]);

    console.log(`Created ${trainees.length} sample trainees`);

    // Create sample projects
    const projects = await Project.bulkCreate([
      {
        trainee_id: trainees[0].id,
        project_name: 'Smart Grid Implementation Analysis',
        description: 'Analysis of smart grid technologies and their implementation challenges in Indian power sector',
        start_date: '2024-01-20',
        due_date: '2024-06-20',
        status: 'in_progress'
      },
      {
        trainee_id: trainees[1].id,
        project_name: 'Renewable Energy Integration Study',
        description: 'Study on integration of renewable energy sources with existing power infrastructure',
        start_date: '2024-02-05',
        end_date: '2024-05-15',
        due_date: '2024-05-30',
        status: 'completed',
        performance_rating: 8
      },
      {
        trainee_id: trainees[3].id,
        project_name: 'Power System Protection Schemes',
        description: 'Analysis of modern protection schemes in power systems',
        start_date: '2024-03-20',
        due_date: '2024-08-20',
        status: 'assigned'
      }
    ]);

    console.log(`Created ${projects.length} sample projects`);

    // Create sample project progress
    const progressEntries = await ProjectProgress.bulkCreate([
      {
        project_id: projects[0].id,
        task_description: 'Literature review on smart grid technologies',
        date: '2024-01-25',
        status: 'completed',
        notes: 'Completed comprehensive literature review covering IEEE papers and industry reports'
      },
      {
        project_id: projects[0].id,
        task_description: 'Data collection on current grid infrastructure',
        date: '2024-02-10',
        status: 'completed',
        notes: 'Collected data from regional power utilities'
      },
      {
        project_id: projects[0].id,
        task_description: 'Analysis of smart grid implementation challenges',
        date: '2024-02-25',
        status: 'in_progress',
        notes: 'Currently analyzing technical and economic challenges'
      },
      {
        project_id: projects[1].id,
        task_description: 'Study of renewable energy sources',
        date: '2024-02-10',
        status: 'completed',
        notes: 'Completed study of solar and wind energy potential'
      },
      {
        project_id: projects[1].id,
        task_description: 'Integration methodology development',
        date: '2024-03-15',
        status: 'completed',
        notes: 'Developed methodology for renewable energy integration'
      }
    ]);

    console.log(`Created ${progressEntries.length} sample progress entries`);

    // Create sample notifications
    const notifications = await Notification.bulkCreate([
      {
        recipient_id: defaultAdmin.id,
        recipient_type: 'admin',
        sender_id: instructors[2].id,
        sender_type: 'instructor',
        message: `New trainee "Rohit Singh" created by ${instructors[2].name} requires approval`,
        type: 'trainee_created',
        read_status: false
      },
      {
        recipient_id: instructors[0].id,
        recipient_type: 'instructor',
        sender_id: defaultAdmin.id,
        sender_type: 'admin',
        message: `Trainee "Arjun Patel" has been approved`,
        type: 'general',
        read_status: true
      },
      {
        recipient_id: instructors[1].id,
        recipient_type: 'instructor',
        sender_id: defaultAdmin.id,
        sender_type: 'admin',
        message: `Trainee "Priya Sharma" has been approved`,
        type: 'general',
        read_status: true
      }
    ]);

    console.log(`Created ${notifications.length} sample notifications`);

    console.log('\n=== Database Seeding Completed Successfully ===');
    console.log('\nDefault Admin Credentials:');
    console.log(`Email: ${defaultAdmin.email}`);
    console.log(`Password: ${process.env.DEFAULT_ADMIN_PASSWORD || 'ja.nvi0125'}`);
    
    console.log('\nSample Instructor Credentials:');
    instructors.forEach((instructor, index) => {
      console.log(`${index + 1}. Email: ${instructor.email}, Password: instructor${(index + 1) * 123}`);
    });

    console.log('\nDatabase Schema Created with Sample Data');
    console.log('You can now start the server and test the application');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
};

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('Seeding completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
}

module.exports = seedDatabase;
