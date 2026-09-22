// Encoding detection and decoding. Files are read as ArrayBuffer and decoded
// in a strict order: UTF-8 first (any invalid byte fails), then GB18030
// (superset of GBK, covers the vast majority of Chinese novels).
// TextDecoder is available in all modern browsers.

// Returns { text, encoding } — encoding is what actually decoded successfully.
function decodeText(buffer, preferred) {
    const encodings = preferred ? [preferred] : ['utf-8', 'gb18030'];
    for (const enc of encodings) {
        try {
            const text = new TextDecoder(enc, { fatal: true }).decode(buffer);
            return { text, encoding: enc };
        } catch (e) {
            // Invalid byte sequence for this encoding — try the next one.
        }
    }
    // Nothing decoded strictly. Fall back to GB18030 with replacement chars
    // so the user at least sees content (and can switch encoding manually).
    return {
        text: new TextDecoder('gb18030').decode(buffer),
        encoding: 'gb18030',
    };
}

// Manual override cycle shown in the settings popover / toolbar hint.
const ENCODING_OPTIONS = ['auto', 'utf-8', 'gb18030'];
const ENCODING_LABELS = { auto: '自动', 'utf-8': 'UTF-8', gb18030: 'GB18030' };

function currentEncodingPreference() {
    const enc = getSettings().encoding;
    return enc === 'auto' ? null : enc;
}
