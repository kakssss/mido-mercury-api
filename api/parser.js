const Mercury = require('@postlight/mercury-parser');
const cheerio = require('cheerio');

module.exports = async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'Missing URL' });

  try {
    const result = await Mercury.parse(url);
    const rawHTML = result.content || '';

    const $ = cheerio.load(rawHTML);

    // 🧹 1. إزالة العناصر المزعجة
    const badSelectors = [
      'aside',
      '.share',
      '.social',
      '.related',
      '.ads',
      '.newsletter',
      'footer',
      'header',
      'nav',
      'script',
      'noscript',
      'iframe'
    ];
    $(badSelectors.join(',')).remove();

    // 🧼 2. إزالة الـ class والـ style من كل العناصر (عشان التنسيق يبقى نضيف)
    $('*').removeAttr('class').removeAttr('style');

    // ✅ 3. نرجع نسخة HTML نضيفة
    const cleanHTML = $('body').html().trim(); // خد كل اللي في الـ body بعد التنضيف

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
