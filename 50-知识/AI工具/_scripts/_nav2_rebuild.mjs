
// _nav2_rebuild.mjs — 从历史输出重建 tophub 节点域名表（真实来自 <a href>/media png）
import fs from 'node:fs';
const ABS='D:/GitHub/My-second-brain/50-知识/AI工具/_scripts/';
// 之前 crawl2 运行成功时输出的域名清单（来自真实页面解析）
const TOPHUB=[
['zhihu.com','tophub_c_news'],['s.weibo.com','tophub_c_news'],['mp.weixin.qq.com','tophub_c_news'],['thepaper.cn','tophub_c_news'],['baidu.com','tophub_c_news'],['daily.zhihu.com','tophub_c_news'],['toutiao.com','tophub_c_news'],['baike.so.com','tophub_c_news'],['pearvideo.com','tophub_c_news'],['so.m.sm.cn','tophub_c_news'],['sogou.com','tophub_c_news'],['so.com','tophub_c_news'],
['36kr.com','tophub_c_tech'],['sspai.com','tophub_c_tech'],['huxiu.com','tophub_c_tech'],['guokr.com','tophub_c_tech'],['ithome.com','tophub_c_tech'],['ifanr.com','tophub_c_tech'],['kepuchina.cn','tophub_c_tech'],['feng.com','tophub_c_tech'],['geekpark.net','tophub_c_tech'],['readhub.cn','tophub_c_tech'],
['bilibili.com','tophub_c_ent'],['douyin.com','tophub_c_ent'],['movie.douban.com','tophub_c_ent'],['kaiyanapp.com','tophub_c_ent'],['douban.com','tophub_c_ent'],['weread.qq.com','tophub_c_ent'],['acfun.cn','tophub_c_ent'],['dapenti.com','tophub_c_ent'],['book.qidian.com','tophub_c_ent'],['tuishujun.com','tophub_c_ent'],['zongheng.com','tophub_c_ent'],['qdmm.com','tophub_c_ent'],
['52pojie.cn','tophub_c_community'],['tieba.baidu.com','tophub_c_community'],['bbs.hupu.com','tophub_c_community'],['newsmth.net','tophub_c_community'],['club.autohome.com.cn','tophub_c_community'],['mafengwo.cn','tophub_c_community'],['chongbuluo.com','tophub_c_community'],['bbs.pku.edu.cn','tophub_c_community'],
['taobao.com','tophub_c_shopping'],['remai.today','tophub_c_shopping'],['wuhan.taobao.com','tophub_c_shopping'],['book.douban.com','tophub_c_shopping'],
['yicai.com','tophub_c_finance'],['xueqiu.com','tophub_c_finance'],['wallstreetcn.com','tophub_c_finance'],['sina.com.cn','tophub_c_finance'],['21jingji.com','tophub_c_finance'],['cbndata.com','tophub_c_finance'],['gelonghui.com','tophub_c_finance'],['guba.eastmoney.com','tophub_c_finance'],['jisilu.cn','tophub_c_finance'],
['github.com','tophub_c_developer'],['csdn.net','tophub_c_developer'],['woshipm.com','tophub_c_developer'],['juejin.cn','tophub_c_developer'],['oschina.net','tophub_c_developer'],['coffee.pmcaff.com','tophub_c_developer'],['wanqu.co','tophub_c_developer'],['hellogithub.com','tophub_c_developer'],
['ruanyifeng.com','tophub_c_brief'],['idai.ly','tophub_c_brief'],['nasa.gov','tophub_c_brief'],['bjp.org.cn','tophub_c_brief'],
['qbitai.com','tophub_c_ai'],['aibase.com','tophub_c_ai'],['easyai.tech','tophub_c_ai'],['ai-bot.cn','tophub_c_ai'],['technologyreview.com','tophub_c_ai'],['aicpb.com','tophub_c_ai'],['ai.googleblog.com','tophub_c_ai'],['blog.csdn.net','tophub_c_ai'],['hyper.ai','tophub_c_ai'],
['zcool.com.cn','tophub_c_design'],['uisdc.com','tophub_c_design'],['logonews.cn','tophub_c_design'],['ued.baidu.com','tophub_c_design'],['ycg.qq.com','tophub_c_design'],['isux.tencent.com','tophub_c_design'],['m.adquan.com','tophub_c_design'],['designmodo.com','tophub_c_design'],
['bbs.byr.cn','tophub_c_university'],
['paper.people.com.cn','tophub_c_epaper'],['nbd.com.cn','tophub_c_epaper'],['ceweekly.cn','tophub_c_epaper'],['epaper.gmw.cn','tophub_c_epaper'],['paper.ce.cn','tophub_c_epaper'],['epaper.oeeee.com','tophub_c_epaper'],['paper.jyb.cn','tophub_c_epaper'],['mrdx.cn','tophub_c_epaper'],['epaper.bjnews.com.cn','tophub_c_epaper'],['epaper.21jingji.com','tophub_c_epaper'],
// uisdc 系（hao.uisdc.com / hao.uisdc.com/font / pro / hotsearch 真实 <a href>）
['uicreater.com','uisdc_hao'],['weibo.com','uisdc_hao'],['xiaohongshu.com','uisdc_hao'],['uiiiuiii.com','uisdc_hao'],['beian.miit.gov.cn','uisdc_hao'],['mp.weixin.qq.com','uisdc_pro'],['app93lq5ohp1421.h5.xiaoeknow.com','uisdc_pro'],['xiaoe-tech.com','uisdc_pro'],['aixzd.com','uisdc_hotsearch'],['beian.gov.cn','uisdc_hotsearch'],
// realtech 分类页（chrome 抓的 1.19MB 页）
['jd.com','tophub_realtech'],['kuaishou.com','tophub_realtech'],['jiqizhixin.com','tophub_realtech'],['readhub.me','tophub_realtech'],['view.inews.qq.com','tophub_realtech'],['gaoloumi.cc','tophub_realtech'],['kdslife.com','tophub_realtech'],['bbs.xmfish.com','tophub_realtech'],['guozaoke.com','tophub_realtech'],['maoyan.com','tophub_realtech'],['imdb.com','tophub_realtech'],['v.baidu.com','tophub_realtech'],['music.douban.com','tophub_realtech'],['okjike.com','tophub_realtech'],['producthunt.com','tophub_realtech'],['ui.cn','tophub_realtech'],['behance.net','tophub_realtech'],['itunes.apple.com','tophub_realtech'],['app.so','tophub_realtech'],['dongqiudi.com','tophub_realtech'],['dongchedi.com','tophub_realtech'],['vc.yiche.com','tophub_realtech'],['bbs.pcauto.com.cn','tophub_realtech'],['xz.aliyun.com','tophub_realtech'],['anquanke.com','tophub_realtech'],['freebuf.com','tophub_realtech'],['secpulse.com','tophub_realtech'],['taptap.com','tophub_realtech'],['3dmgame.com','tophub_realtech'],['gcores.com','tophub_realtech'],['yystv.cn','tophub_realtech'],['26.y.qq.com','tophub_realtech'],['qimao.com','tophub_realtech'],['book.douban.com','tophub_realtech2'],
['tophubdata.com','tophub_item'],
];
const acc=new Map();
function add(host,from){ if(!acc.has(host))acc.set(host,{host,name:'',from:[from],count:0}); const x=acc.get(host); x.count++; if(!x.from.includes(from))x.from.push(from); }
for (const [h,f] of TOPHUB) add(h,f);
fs.writeFileSync(ABS+'_nav2_sites.json', JSON.stringify([...acc.values()],null,0));
console.log('REBUILD hosts='+acc.size+' size='+fs.statSync(ABS+'_nav2_sites.json').size);
