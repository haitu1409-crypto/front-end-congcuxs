import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const ENV_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || null;
const ENV_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || null;
const ENV_UPLOAD_FOLDER = process.env.NEXT_PUBLIC_CHAT_UPLOAD_FOLDER || null;
const ENV_MAIN_TRANSFORMATION = process.env.NEXT_PUBLIC_CHAT_IMAGE_TRANSFORMATION || null;
const ENV_THUMB_TRANSFORMATION = process.env.NEXT_PUBLIC_CHAT_IMAGE_THUMB_TRANSFORMATION || null;
const ENV_UPLOAD_URL = ENV_CLOUD_NAME
    ? `https://api.cloudinary.com/v1_1/${ENV_CLOUD_NAME}/image/upload`
    : null;

const DEFAULT_ALLOWED_MIME = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/heic',
    'image/heif'
];

const DEFAULT_MAX_BYTES = Number(process.env.NEXT_PUBLIC_CHAT_MAX_IMAGE_BYTES) || (6 * 1024 * 1024);
const DEFAULT_MAX_ATTACHMENTS = Number(process.env.NEXT_PUBLIC_CHAT_MAX_IMAGE_COUNT) || 4;
const CONFIG_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

let cachedConfig = null;
let cachedConfigTimestamp = 0;
let inflightConfigPromise = null;

const buildEnvConfig = () => {
    if (!ENV_CLOUD_NAME || !ENV_UPLOAD_PRESET) {
        return null;
    }

    return {
        source: 'env',
        mode: 'preset',
        cloudName: ENV_CLOUD_NAME,
        uploadPreset: ENV_UPLOAD_PRESET,
        folder: ENV_UPLOAD_FOLDER || undefined,
        uploadUrl: ENV_UPLOAD_URL,
        transformation: ENV_MAIN_TRANSFORMATION || undefined,
        thumbTransformation: ENV_THUMB_TRANSFORMATION || undefined,
        maxBytes: DEFAULT_MAX_BYTES,
        maxAttachments: DEFAULT_MAX_ATTACHMENTS,
        allowedMimeTypes: DEFAULT_ALLOWED_MIME
    };
};

const normaliseConfig = (config = {}) => ({
    ...config,
    allowedMimeTypes: Array.isArray(config.allowedMimeTypes) && config.allowedMimeTypes.length > 0
        ? config.allowedMimeTypes
        : DEFAULT_ALLOWED_MIME,
    maxBytes: Number(config.maxBytes) || DEFAULT_MAX_BYTES,
    maxAttachments: Number(config.maxAttachments) || DEFAULT_MAX_ATTACHMENTS,
    transformation: config.transformation || ENV_MAIN_TRANSFORMATION || undefined,
    thumbTransformation: config.thumbTransformation || ENV_THUMB_TRANSFORMATION || undefined,
    uploadUrl: config.uploadUrl || (config.cloudName ? `https://api.cloudinary.com/v1_1/${config.cloudName}/image/upload` : ENV_UPLOAD_URL || null)
});

export const warmupChatUploadConfig = async (token) => {
    try {
        await getChatUploadConfig(token);
    } catch (error) {
        console.warn('⚠️  Không thể warmup cấu hình upload chat:', error?.message || error);
    }
};

export const getChatUploadConfig = async (token) => {
    const now = Date.now();

    if (cachedConfig && (now - cachedConfigTimestamp) < CONFIG_CACHE_TTL) {
        return cachedConfig;
    }

    if (!token) {
        // Không có token -> fallback env nếu có
        if (cachedConfig) {
            return cachedConfig;
        }
        const envConfig = buildEnvConfig();
        if (envConfig) {
            cachedConfig = normaliseConfig(envConfig);
            cachedConfigTimestamp = now;
            return cachedConfig;
        }
        throw new Error('Thiếu token để lấy cấu hình upload chat');
    }

    if (inflightConfigPromise) {
        return inflightConfigPromise;
    }

    inflightConfigPromise = axios.get(`${API_URL}/api/chat/media/config`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    }).then((response) => {
        if (!response.data?.success) {
            throw new Error(response.data?.message || 'Không thể lấy cấu hình upload chat');
        }

        cachedConfig = normaliseConfig({
            ...response.data.data,
            source: 'api'
        });
        cachedConfigTimestamp = Date.now();
        return cachedConfig;
    }).catch((error) => {
        // Fallback env nếu có
        const envConfig = buildEnvConfig();
        if (envConfig) {
            cachedConfig = normaliseConfig(envConfig);
            cachedConfigTimestamp = Date.now();
            return cachedConfig;
        }
        throw error;
    }).finally(() => {
        inflightConfigPromise = null;
    });

    return inflightConfigPromise;
};

const applyTransformation = (url, transformation) => {
    if (!url || !transformation || !url.includes('/upload/')) {
        return url;
    }
    return url.replace('/upload/', `/upload/${transformation}/`);
};

export const buildTransformedUrls = (secureUrl, config = {}) => {
    if (!secureUrl) {
        return {
            mainUrl: secureUrl,
            thumbUrl: secureUrl
        };
    }

    const mainUrl = applyTransformation(secureUrl, config.transformation) || secureUrl;
    const thumbUrl = applyTransformation(secureUrl, config.thumbTransformation) || mainUrl;

    return {
        mainUrl,
        thumbUrl
    };
};

export const generateChatPublicId = (userId) => {
    const safeUserId = userId || 'user';
    return `chat_${safeUserId}_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
};

const performDirectUpload = async ({ file, config, signatureData, onProgress, publicId }) => {
    const uploadUrl = signatureData?.uploadUrl || config.uploadUrl;

    if (!uploadUrl) {
        throw new Error('Thiếu upload URL cho Cloudinary');
    }

    const formData = new FormData();
    formData.append('file', file);

    if (config.mode === 'preset') {
        if (!config.uploadPreset) {
            throw new Error('Thiếu upload preset cho Cloudinary');
        }
        formData.append('upload_preset', config.uploadPreset);
        if (config.folder) {
            formData.append('folder', config.folder);
        }
        if (publicId) {
            formData.append('public_id', publicId);
        }
    } else {
        if (!signatureData?.signature || !signatureData?.timestamp || !signatureData?.apiKey) {
            throw new Error('Thiếu thông tin chữ ký upload');
        }
        formData.append('timestamp', signatureData.timestamp);
        formData.append('signature', signatureData.signature);
        formData.append('api_key', signatureData.apiKey);
        formData.append('resource_type', 'image');
        formData.append('public_id', signatureData.publicId || publicId);
        if (signatureData.folder) {
            formData.append('folder', signatureData.folder);
        } else if (config.folder) {
            formData.append('folder', config.folder);
        }
        if (signatureData.transformation) {
            formData.append('transformation', signatureData.transformation);
        }
    }

    const response = await axios.post(uploadUrl, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (event) => {
            if (!onProgress || !event.total) return;
            const percent = Math.round((event.loaded / event.total) * 100);
            onProgress(percent);
        }
    });

    const uploadData = response.data;
    const secureUrl = uploadData.secure_url || uploadData.url;
    const { mainUrl, thumbUrl } = buildTransformedUrls(secureUrl, signatureData || config);

    return {
        url: mainUrl,
        secureUrl: mainUrl,
        thumbnailUrl: thumbUrl,
        publicId: uploadData.public_id,
        resourceType: uploadData.resource_type || 'image',
        format: uploadData.format,
        bytes: uploadData.bytes,
        width: uploadData.width,
        height: uploadData.height,
        originalFilename: uploadData.original_filename,
        createdAt: uploadData.created_at
    };
};

export const uploadChatAttachment = async ({ file, token, publicId, onProgress, originalFileName }) => {
    if (!file) {
        throw new Error('Thiếu file để upload');
    }
    if (!token) {
        throw new Error('Bạn cần đăng nhập để upload ảnh');
    }

    const config = await getChatUploadConfig(token);
    const effectivePublicId = publicId || generateChatPublicId();

    let signatureData = null;

    if (config.mode !== 'preset') {
        const signatureResponse = await axios.get(`${API_URL}/api/chat/media/signature`, {
            params: {
                publicId: effectivePublicId
            },
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!signatureResponse.data?.success) {
            throw new Error(signatureResponse.data?.message || 'Không thể tạo chữ ký upload');
        }

        signatureData = {
            ...signatureResponse.data.data,
            transformation: signatureResponse.data.data?.transformation || config.transformation,
            thumbTransformation: signatureResponse.data.data?.thumbTransformation || config.thumbTransformation
        };
    }

    try {
        return await performDirectUpload({
            file,
            config,
            signatureData,
            onProgress,
            publicId: effectivePublicId
        });
    } catch (directError) {
        console.warn('⚠️  Cloudinary direct upload thất bại, fallback qua backend:', directError?.message || directError);

        try {
            const fallbackForm = new FormData();
            fallbackForm.append('image', file);
            if (originalFileName) {
                fallbackForm.append('filename', originalFileName);
            }

            const fallbackResponse = await axios.post(`${API_URL}/api/chat/media/image`, fallbackForm, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                },
                onUploadProgress: (event) => {
                    if (!onProgress || !event.total) return;
                    const percent = Math.round((event.loaded / event.total) * 100);
                    onProgress(percent);
                }
            });

            if (fallbackResponse.data?.success && fallbackResponse.data?.data?.attachment) {
                return fallbackResponse.data.data.attachment;
            }

            throw new Error(fallbackResponse.data?.message || 'Upload ảnh thất bại');
        } catch (fallbackError) {
            console.error('❌ Upload chat image error:', fallbackError);
            throw fallbackError;
        }
    }
};

export const getCachedChatUploadConfig = () => cachedConfig;


