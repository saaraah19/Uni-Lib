const cron = require('node-cron');
const Loan = require('./models/Loan');
const Notification = require('./models/Notification')

// This runs every day at 8 AM
cron.schedule('0 8 * * *', async () => {
  console.log('🔔 Checking for loans due in 3 days...');
  
  try {
    // Calculate today and the date 3 days from now
    const today = new Date();
    const targetDate = new Date();
    targetDate.setDate(today.getDate() + 3);
    
    // Set to start and end of that day
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Find all active loans due exactly 3 days from now
    const loans = await Loan.find({
      status: 'active',
      dueDate: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    }).populate('book', 'title');

    console.log(`Found ${loans.length} loans due in 3 days`);

    // Send a notification for each loan
    for (const loan of loans) {
      const formattedDate = loan.dueDate.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });

      await Notification.create({
        user: loan.user,
        title: '📚 Rappel de retour',
        message: `Le livre "${loan.book.title}" doit être retourné dans 3 jours (Date limite: ${formattedDate}).`,
        type: 'warning',
        status: 'unread'
      });

      console.log(`✅ Reminder sent for loan ${loan._id}`);
    }
  } catch (error) {
    console.error('Error in reminder service:', error);
  }
}, {
  timezone: "Africa/Casablanca" // Change this to your timezone
});

console.log('✅ Reminder cron job started');