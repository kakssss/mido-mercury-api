const Mercury = require('@postlight/mercury-parser');
const cheerio = require('cheerio');

module.exports = async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'Missing URL' });

  try {
    const result = await Mercury.parse(url);
    const originalHTML = result.content || '';
    const $ = cheerio.load(originalHTML);

    // ✅ شيل العناصر اللي دايمًا بتكون مزعجة
    $('aside, .share, .social, .related, .ads, .ad, .newsletter, footer, header, script, nav').remove();

    // ✅ شيل الـ comments في HTML
    $('*').contents().each(function () {
      if (this.type === 'comment') $(this).remove();
    });

    // ✅ شيل الـ inline styles اللي ملهاش لازمة
    $('[style]').removeAttr('style');
    $('[class]').removeAttr('class');

    // ✅ احتفظ فقط بعناصر العرض الأساسية
    const allowedTags = ['p', 'strong', 'em', 'ul', 'ol', 'li', 'img', 'h1', 'h2', 'h3', 'h4', 'blockquote', 'br', 'pre', 'code', 'a'];
    $('*').each(function () {
      if (!allowedTags.includes($(this)[0].tagName)) {
        $(this).replaceWith($(this).contents());
      }
    });

    const cleanHTML = $.html().trim();

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
