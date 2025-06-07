const Mercury = require('@postlight/mercury-parser');
const cheerio = require('cheerio');

module.exports = async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'Missing URL' });

  try {
    const result = await Mercury.parse(url);
    const rawHTML = result.content || '';

    // ✅ نستخدم Cheerio لتنضيف المحتوى
    const $ = cheerio.load(rawHTML);

    // 🧹 إزالة العناصر المزعجة
    const badSelectors = [
      'aside',
      'header',
      'footer',
      'nav',
      'script',
      'style',
      '.share',
      '.related',
      '.ads',
      '.ad',
      '.newsletter',
      '.social',
      'noscript',
      'iframe'
    ];
    $(badSelectors.join(',')).remove();

    // 🔧 إزالة class و style من كل العناصر
    $('*').each((_, el) => {
      $(el).removeAttr('class').removeAttr('style');
    });

    // ✅ بعد التنضيف، نحافظ على الـ HTML النهائي
    const cleanHTML = $('body').html().trim();

    // 🎁 الرد النهائي
    res.json({
      title: result.title,
      lead_image_url: result.lead_image_url,
      url: result.url,
      content_html: cleanHTML
    });
  } catch (err) {
    res.status(500).json({ error: err.toString() });
  }
};
