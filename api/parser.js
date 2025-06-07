const Mercury = require('@postlight/mercury-parser');
const cheerio = require('cheerio');

module.exports = async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'Missing URL' });

  try {
    const result = await Mercury.parse(url);
    const rawHTML = result.content || '';

    // ✅ تحميل الـ HTML للتنضيف
    const $ = cheerio.load(rawHTML);

    // 🧹 إزالة العناصر الغير مرغوبة
    const badSelectors = [
      'aside', 'header', 'footer', 'nav', 'script', 'style',
      '.share', '.related', '.ads', '.ad', '.newsletter',
      '.social', 'noscript', 'iframe'
    ];
    $(badSelectors.join(',')).remove();

    // ❌ إزالة العناصر الفاضية
    $('*').each((_, el) => {
      const content = $(el).html()?.trim();
      if (!content) {
        $(el).remove();
      }
    });

    // 🖼️ حذف الصور اللي ملهاش src سليم
    $('img').each((_, el) => {
      const src = $(el).attr('src');
      if (!src || !src.startsWith('http')) {
        $(el).remove();
      }
    });

    // 💅 إزالة كل class و style
    $('*').each((_, el) => {
      $(el).removeAttr('class').removeAttr('style');
    });

    // ✨ تنسيق بسيط للباراجرافات (اختياري لو بتحب تبقى القراءة أسهل)
    $('p').each((_, el) => {
      $(el).prepend('\n').append('\n');
    });

    // 🔧 استخراج المحتوى المنظف
    const cleanHTML = $('body').html()?.trim() || $.root().html().trim();

    // 🎯 الرد النهائي
    res.json({
      title: result.title?.trim() || '',
      lead_image_url: result.lead_image_url || '',
      url: result.url || url,
      content_html: cleanHTML
    });
  } catch (err) {
    res.status(500).json({ error: err.toString() });
  }
};
