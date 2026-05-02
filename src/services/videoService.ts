
const PEXELS_API_KEY = 'ZQbpIKrNpqvGBfUujRxPeLaB2ZzZSENpAmqfhcPbW2DojMavCdjCLfJu';
const PIXABAY_API_KEY = '54537513-1feeeea169df1bc7152869bac';

export interface VideoAsset {
    id: string;
    url: string;
    thumbnail: string;
    duration: number;
    source: 'pexels' | 'pixabay';
    width: number;
    height: number;
    tags: string[];
}

export const searchPexelsVideos = async (query: string, perPage: number = 5): Promise<VideoAsset[]> => {
    try {
        const response = await fetch(`https://api.pexels.com/videos/search?query=${encodeURIComponent(query)}&per_page=${perPage}`, {
            headers: {
                Authorization: PEXELS_API_KEY
            }
        });
        const data = await response.json();
        return data.videos.map((v: any) => ({
            id: `pexels-${v.id}`,
            url: v.video_files.find((f: any) => f.quality === 'hd')?.link || v.video_files[0].link,
            thumbnail: v.image,
            duration: v.duration,
            source: 'pexels',
            width: v.width,
            height: v.height,
            tags: [] // Pexels search doesn't return easy tags per video in basic search
        }));
    } catch (error) {
        console.error('Pexels API Error:', error);
        return [];
    }
};

export const searchPixabayVideos = async (query: string, perPage: number = 5): Promise<VideoAsset[]> => {
    try {
        const response = await fetch(`https://pixabay.com/api/videos/?key=${PIXABAY_API_KEY}&q=${encodeURIComponent(query)}&per_page=${perPage}`);
        const data = await response.json();
        return data.hits.map((v: any) => ({
            id: `pixabay-${v.id}`,
            url: v.videos.medium.url,
            thumbnail: `https://i.vimeocdn.com/video/${v.picture_id}_640x360.jpg`,
            duration: v.duration,
            source: 'pixabay',
            width: v.width,
            height: v.height,
            tags: v.tags.split(', ')
        }));
    } catch (error) {
        console.error('Pixabay API Error:', error);
        return [];
    }
};

/**
 * Searches both providers and merges results
 */
export const searchAllVideoAssets = async (query: string): Promise<VideoAsset[]> => {
    const [pexels, pixabay] = await Promise.all([
        searchPexelsVideos(query, 10),
        searchPixabayVideos(query, 10)
    ]);
    return [...pexels, ...pixabay]; // PRESERVE RELEVANCE ORDER
};
