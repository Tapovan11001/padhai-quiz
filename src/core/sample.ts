import type { Quiz } from "./quiz.ts";

// A short chapter written for this project (Class 8 science level), and a quiz on it.

export const CHAPTER = `Friction

When you push a book across a table, it slows down and stops. The force that slows it is friction. Friction acts between two surfaces in contact, and it always acts opposite to the direction of motion.

Friction comes from the tiny bumps on every surface. Even surfaces that look smooth have them. When two surfaces press together, these bumps lock into each other. A rough surface, like a carpet or a gravel road, has bigger bumps and so more friction. A smooth surface like glass or ice has less friction, which is why it is easy to slip on ice.

Friction can be reduced. Powder on a carrom board makes the striker slide easily. Oil and grease in machines are called lubricants; they form a thin layer between moving parts. Wheels help because rolling friction is much smaller than sliding friction. Ball bearings in a cycle use this idea.

Sometimes we want more friction. The treads on tyres and the grooves on shoe soles increase friction and give a better grip on the road.

Objects moving through water or air also face friction. This is called fluid friction, or drag. Birds, fish, boats and aeroplanes have streamlined shapes to reduce drag.`;

const q = (id: string, topic: string, en: string, hi: string, options: [string, string][], answer: number, exEn: string, exHi: string) => ({
  id, topic, question: { en, hi }, options: options.map(([e, h]) => ({ en: e, hi: h })), answer, explanation: { en: exEn, hi: exHi },
});

export const QUIZ: Quiz = {
  title: { en: "Friction", hi: "घर्षण" },
  questions: [
    q("f1", "What friction is", "In which direction does friction act?", "घर्षण किस दिशा में लगता है?",
      [["Opposite to the direction of motion", "गति की विपरीत दिशा में"], ["In the direction of motion", "गति की दिशा में"], ["Always upward", "हमेशा ऊपर की ओर"], ["Always downward", "हमेशा नीचे की ओर"]], 0,
      "Friction always opposes motion. That's why a pushed book slows down and stops.",
      "घर्षण हमेशा गति का विरोध करता है। इसीलिए धकेली गई किताब धीमी होकर रुक जाती है।"),
    q("f2", "Why friction happens", "Why does a rough surface have more friction?", "खुरदुरी सतह पर ज़्यादा घर्षण क्यों होता है?",
      [["Its bigger bumps lock into the other surface", "इसके बड़े उभार दूसरी सतह में फँस जाते हैं"], ["It is always heavier", "यह हमेशा भारी होती है"], ["It is always hotter", "यह हमेशा गर्म होती है"], ["It has magnets in it", "इसमें चुंबक होते हैं"]], 0,
      "Every surface has tiny bumps. On rough surfaces the bumps are bigger, so they lock together more.",
      "हर सतह पर छोटे-छोटे उभार होते हैं। खुरदुरी सतह पर ये उभार बड़े होते हैं, इसलिए ज़्यादा फँसते हैं।"),
    q("f3", "Why friction happens", "On which surface is it easiest to slip?", "किस सतह पर फिसलना सबसे आसान है?",
      [["Ice", "बर्फ़"], ["Carpet", "कालीन"], ["Gravel road", "बजरी वाली सड़क"], ["Shoe sole grooves", "जूते के तले के खाँचे"]], 0,
      "Ice is very smooth, so it has very little friction.",
      "बर्फ़ बहुत चिकनी होती है, इसलिए उस पर घर्षण बहुत कम होता है।"),
    q("f4", "Reducing friction", "Why do ball bearings reduce friction in a cycle?", "साइकिल में बॉल बेयरिंग घर्षण क्यों कम करते हैं?",
      [["Rolling friction is smaller than sliding friction", "लोटनिक (रोलिंग) घर्षण, सर्पी (स्लाइडिंग) घर्षण से कम होता है"], ["They make the wheel heavier", "वे पहिये को भारी बनाते हैं"], ["They heat the axle", "वे धुरी को गर्म करते हैं"], ["They add more bumps", "वे और उभार जोड़ते हैं"]], 0,
      "Rolling friction is much smaller than sliding friction, so balls that roll make the wheel turn easily.",
      "लोटनिक घर्षण सर्पी घर्षण से बहुत कम होता है, इसलिए लुढ़कती गोलियों से पहिया आसानी से घूमता है।"),
    q("f5", "Reducing friction", "What are oil and grease in machines called?", "मशीनों में तेल और ग्रीस को क्या कहते हैं?",
      [["Lubricants", "स्नेहक (लुब्रिकेंट)"], ["Magnets", "चुंबक"], ["Treads", "ट्रेड"], ["Bearings", "बेयरिंग"]], 0,
      "Lubricants form a thin layer between moving parts, which reduces friction.",
      "स्नेहक चलते हुए हिस्सों के बीच एक पतली परत बनाते हैं, जिससे घर्षण कम होता है।"),
    q("f6", "Increasing friction", "Why do tyres have treads?", "टायरों पर ट्रेड (खाँचे) क्यों होते हैं?",
      [["To increase friction and grip the road", "घर्षण और सड़क पर पकड़ बढ़ाने के लिए"], ["To make tyres lighter", "टायर हल्के करने के लिए"], ["To reduce friction", "घर्षण कम करने के लिए"], ["Only for decoration", "सिर्फ़ सजावट के लिए"]], 0,
      "Treads increase friction, giving a better grip on the road.",
      "ट्रेड घर्षण बढ़ाते हैं, जिससे सड़क पर बेहतर पकड़ मिलती है।"),
    q("f7", "Fluid friction", "What is another name for fluid friction?", "तरल घर्षण का दूसरा नाम क्या है?",
      [["Drag", "कर्षण (ड्रैग)"], ["Gravity", "गुरुत्व"], ["Grip", "पकड़"], ["Lubricant", "स्नेहक"]], 0,
      "Friction from moving through water or air is called fluid friction, or drag.",
      "पानी या हवा में चलने पर लगने वाले घर्षण को तरल घर्षण या कर्षण (ड्रैग) कहते हैं।"),
    q("f8", "Fluid friction", "Why do boats and aeroplanes have streamlined shapes?", "नाव और हवाई जहाज़ का आकार धारारेखित (स्ट्रीमलाइन) क्यों होता है?",
      [["To reduce drag", "कर्षण (ड्रैग) कम करने के लिए"], ["To increase drag", "कर्षण बढ़ाने के लिए"], ["To look like birds", "पक्षियों जैसा दिखने के लिए"], ["To carry more weight", "ज़्यादा वज़न उठाने के लिए"]], 0,
      "A streamlined shape lets water or air flow past easily, so there is less drag.",
      "धारारेखित आकार से पानी या हवा आसानी से निकल जाती है, इसलिए कर्षण कम होता है।"),
  ],
};
