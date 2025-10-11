export const formatTimeAgo = (timestamp: string): string => {
  const now = new Date();
  const past = new Date(timestamp);
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'just now';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `${diffInWeeks} week${diffInWeeks === 1 ? '' : 's'} ago`;
  }

  const options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  };
  return past.toLocaleDateString('en-US', options);
};

export const groupActivitiesByDate = (activities: any[]): Record<string, any[]> => {
  const now = new Date();
  const groups: Record<string, any[]> = {
    'Today': [],
    'Yesterday': [],
    'This Week': [],
    'This Month': [],
    'Earlier': []
  };

  activities.forEach(activity => {
    const activityDate = new Date(activity.created_at);
    const diffInDays = Math.floor((now.getTime() - activityDate.getTime()) / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) {
      groups['Today'].push(activity);
    } else if (diffInDays === 1) {
      groups['Yesterday'].push(activity);
    } else if (diffInDays < 7) {
      groups['This Week'].push(activity);
    } else if (diffInDays < 30) {
      groups['This Month'].push(activity);
    } else {
      groups['Earlier'].push(activity);
    }
  });

  return groups;
};
