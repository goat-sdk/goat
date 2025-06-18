export const countdownToTimestamp = (unixTimestamp: number, completeText: string, showFullTimer?: boolean): string => {
    // Get the current time and calculate the difference
    const now = new Date().getTime();
    const diff = unixTimestamp * 1000 - now;

    // Ensure the timestamp is in the future
    if (diff <= 0) {
        return completeText;
    }

    // Calculate days, hours, minutes, and seconds
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    // Format the countdown string
    let countdownString = "";
    if (days > 0) {
        countdownString += `${days} day${days > 1 ? "s" : ""} ${hours} hour${hours > 1 ? "s" : ""} `;
        if (showFullTimer) {
            countdownString += `${minutes} minute${minutes > 1 ? "s" : ""} ${seconds} second${seconds > 1 ? "s" : ""}`;
        }
    } else if (hours > 0) {
        countdownString += `${hours} hour${hours > 1 ? "s" : ""} ${minutes} minute${minutes > 1 ? "s" : ""} `;
        if (showFullTimer) {
            countdownString += `${seconds} second${seconds > 1 ? "s" : ""}`;
        }
    } else if (minutes > 0) {
        countdownString += `${minutes} minute${minutes > 1 ? "s" : ""} ${seconds} second${seconds > 1 ? "s" : ""}`;
    } else {
        countdownString += `${seconds} second${seconds > 1 ? "s" : ""}`;
    }

    return countdownString.trim();
};
