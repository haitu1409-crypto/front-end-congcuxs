const rawChatGifs = [
    { id: 'secret', file: 'secret.gif', label: 'Bí mật', keywords: ['secret', 'quiet', 'secretive'] },
    { id: 'kiss', file: 'kiss.gif', label: 'Hôn', keywords: ['kiss', 'love', 'romance'] },
    { id: 'devil', file: 'devil.gif', label: 'Tinh nghịch', keywords: ['devil', 'cheeky', 'mischief'] },
    { id: 'shy', file: 'shy.gif', label: 'Ngại ngùng', keywords: ['shy', 'bashful', 'cute'] },
    { id: 'dislike', file: 'dislike.gif', label: 'Không thích', keywords: ['dislike', 'nope', 'thumbs down'] },
    { id: 'laugh', file: 'laugh.gif', label: 'Cười lớn', keywords: ['laugh', 'haha', 'lol'] },
    { id: 'cynical', file: 'cynical.gif', label: 'Bất cần', keywords: ['cynical', 'meh', 'whatever'] },
    { id: 'wink', file: 'wink.gif', label: 'Nháy mắt', keywords: ['wink', 'flirt', 'tease'] },
    { id: 'greed', file: 'greed.gif', label: 'Tham lam', keywords: ['greed', 'money', 'cash'] },
    { id: 'sad-variant', file: 'sad (1).gif', label: 'Buồn (biểu cảm 1)', keywords: ['sad', 'cry', 'tear'] },
    { id: 'happy', file: 'happy.gif', label: 'Vui vẻ', keywords: ['happy', 'smile', 'yay'] },
    { id: 'sweat', file: 'sweat.gif', label: 'Đổ mồ hôi', keywords: ['sweat', 'nervous', 'stress'] },
    { id: 'sad', file: 'sad.gif', label: 'Buồn bã', keywords: ['sad', 'down', 'blue'] },
    { id: 'worried', file: 'worried.gif', label: 'Lo lắng', keywords: ['worried', 'anxious', 'concerned'] },
    { id: 'santa', file: 'santa-claus.gif', label: 'Ông già Noel', keywords: ['santa', 'christmas', 'holiday'] },
    { id: 'rupee', file: 'rupee.gif', label: 'Rupee', keywords: ['rupee', 'money', 'currency'] },
    { id: 'dollar', file: 'dollar.gif', label: 'Dollar', keywords: ['dollar', 'money', 'usd'] },
    { id: 'beagle', file: 'beagle.gif', label: 'Chú chó Beagle', keywords: ['dog', 'beagle', 'pet'] },
    { id: 'in-love', file: 'in-love.gif', label: 'Đang yêu', keywords: ['love', 'heart', 'romantic'] },
    { id: 'angry-variant', file: 'angry (1).gif', label: 'Giận dữ (biểu cảm 1)', keywords: ['angry', 'mad', 'rage'] },
    { id: 'party', file: 'party.gif', label: 'Ăn mừng', keywords: ['party', 'celebrate', 'yay'] },
    { id: 'angry', file: 'angry.gif', label: 'Giận dữ', keywords: ['angry', 'mad', 'rage'] },
    { id: 'humor', file: 'humor.gif', label: 'Hài hước', keywords: ['funny', 'joke', 'humor'] },
    { id: 'rating', file: 'rating.gif', label: 'Chấm điểm', keywords: ['rating', 'score', 'star'] },
    { id: 'axe', file: 'axe.gif', label: 'Chiến binh', keywords: ['axe', 'attack', 'fight'] }
];

const normalizeKeywords = (keywords = []) => {
    return keywords
        .map((keyword) => keyword && keyword.toString().trim().toLowerCase())
        .filter(Boolean);
};

const chatGifs = rawChatGifs.map((gif) => {
    const normalizedId = gif.id.trim().toLowerCase();
    return {
        ...gif,
        id: normalizedId,
        keywords: normalizeKeywords([gif.label, ...(gif.keywords || [])])
    };
});

const chatGifMap = new Map(chatGifs.map((gif) => [gif.id, gif]));

const encodeFileName = (fileName) => encodeURIComponent(fileName).replace(/%2F/gi, '/');

const buildGifUrl = (fileName) => `/gif/${encodeFileName(fileName)}`;

const getChatGifById = (id) => {
    if (!id) return null;
    return chatGifMap.get(id.toLowerCase()) || null;
};

const getChatGifUrl = (idOrGif) => {
    if (!idOrGif) return null;
    if (typeof idOrGif === 'string') {
        const gif = getChatGifById(idOrGif);
        return gif ? buildGifUrl(gif.file) : null;
    }
    if (idOrGif.file) {
        return buildGifUrl(idOrGif.file);
    }
    return null;
};

const searchChatGifs = (query) => {
    const normalized = (query || '').trim().toLowerCase();
    if (!normalized) return chatGifs;
    return chatGifs.filter((gif) => gif.keywords.some((keyword) => keyword.includes(normalized)));
};

export {
    chatGifs,
    chatGifMap,
    getChatGifById,
    getChatGifUrl,
    searchChatGifs
};






















