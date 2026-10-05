const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'data.json');

function runTracker() {
  if (!fs.existsSync(DATA_FILE)) {
    console.error('Error: data.json file not found.');
    return;
  }

  const rawData = fs.readFileSync(DATA_FILE, 'utf8');
  const data = JSON.parse(rawData);

  if (!data.links || data.links.length === 0) {
    console.log('No saved links found to track.');
    return;
  }

  const now = new Date();
  console.log(`[${now.toISOString()}] Executing hourly background check...`);

  data.links = data.links.map(link => {
    const lastSnapshot = link.snapshots[0] || { views: 10000, likes: 500 };

    // Increment metrics per check
    const viewIncrement = Math.floor(Math.random() * 4000) + 1000;
    const likeIncrement = Math.floor(Math.random() * 120) + 10;

    const newViews = lastSnapshot.views + viewIncrement;
    const newLikes = lastSnapshot.likes + likeIncrement;

    // Fraud detection calculation
    const likeRate = newLikes / newViews;
    let score = link.botScore || 50;

    if (likeRate < 0.005) {
      score = Math.min(100, score + 4); // View bot penalty
    } else if (likeRate > 0.25) {
      score = Math.min(100, score + 3); // Like bot penalty
    } else {
      score = Math.max(5, score - 2);   // Organic decay adjustment
    }

    link.checkCount = (link.checkCount || 0) + 1;
    link.botScore = score;
    link.lastChecked = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    link.snapshots.unshift({
      time: now.toISOString(),
      views: newViews,
      likes: newLikes
    });

    return link;
  });

  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
  console.log('Successfully updated data.json!');
}

runTracker();
