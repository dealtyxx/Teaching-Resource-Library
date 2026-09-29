"""离散数学课程资源库 · 统一课程目录（唯一数据源）。

站点的章节编号、规范名称、案例标记、三阶层页面路径都在这里定义；
`apply_catalog.py` 据此批量规范各页面元数据，并生成 shared/catalog.js 与主页目录。
新增小节时只需在 UNITS 里追加一行，再运行 apply_catalog.py。
"""
import os, re, json

SITE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'Discrete_Mathematics'))
BASE_URL = 'https://dealtyxx.github.io/Teaching-Resource-Library/Discrete_Mathematics/'
SITE_NAME = '离散数学课程资源库'
ORG = '湖南信息学院'

# (章号, 章名, 主页筛选类别, 目录名, 该章「应用」领域名)
CHAPTERS = [
    (1,  '计数基础与数论基础',   '基础', '1计数基础与数论基础',   '数论'),
    (2,  '集合及其运算',         '基础', '2集合及其运算',         '集合论'),
    (3,  '二元关系',             '关系', '3二元关系',             '二元关系'),
    (4,  '特殊关系与函数',       '关系', '4特殊关系',             '关系与函数'),
    (5,  '命题逻辑',             '逻辑', '5命题逻辑',             '命题逻辑'),
    (6,  '谓词逻辑',             '逻辑', '6谓词逻辑',             '谓词逻辑'),
    (7,  '图论基础',             '图',   '7图论基础',             '图论'),
    (8,  '特殊图',               '图',   '8特殊图',               '特殊图'),
    (9,  '代数系统',             '代数', '9代数系统',             '代数系统'),
    (10, '群论基础',             '代数', '10群论基础',            '群论'),
    (11, '环、域、格和布尔代数', '代数', '11环、域、格和布尔代数', '环与格'),
]

def cn(n):
    return ['', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一'][n]

# 每个单元一行：(编号, 规范名称, 是否案例, 主页面相对路径[, 分部名])
# 主页面 = 进阶层；基础层/拓展层页面为同名加 -basic / -extend 后缀。
# 编号相同的多个页面表示同一小节的不同分部（如 8.6 生成树的搜索与最小生成树）。
U = []
def add(ch, num, name, case, path, part=None, tiers=None):
    U.append(dict(ch=ch, num=num, name=name, case=case, path=path, part=part, tiers=tiers))

# ---- 第1章 ----
c = '1计数基础与数论基础/'
add(1, '1.1.1', '计数原理基本概念', False, c + '1.1.1基本概念/counting.html')
add(1, '1.1.2', '鸽巢原理',         False, c + '1.1.2鸽巢原理/pigeonhole.html',
    tiers=[c + '1.1.2鸽巢原理/pigeon-basic.html', c + '1.1.2鸽巢原理/pigeonhole.html', c + '1.1.2鸽巢原理/pigeon-extend.html'])
add(1, '1.2.1', '整除性和模运算',   False, c + '1.2.1整除性和模运算/modular.html')
add(1, '1.2.2', '素数和最大公因数', False, c + '1.2.2素数和最大公因数/prime.html')
add(1, '1.2.3', '同余方程',         False, c + '1.2.3同余方程/congruence.html')
add(1, '1.2.4', '欧拉函数和费马小定理', False, c + '1.2.4欧拉函数和费马小定理/euler.html')
add(1, '1.3.1', '哈希函数设计案例', True,  c + '1.3.1哈希函数设计/hash.html')
add(1, '1.3.2', '伪随机数生成案例', True,  c + '1.3.2伪随机数生成/random.html')
add(1, '1.3.3', '校验码设计案例',   True,  c + '1.3.3校验码设计/checksum.html')
add(1, '1.3.4', 'RSA加密算法设计案例', True, c + '1.3.4RSA加密算法设计/rsa.html')
# ---- 第2章 ----
c = '2集合及其运算/'
add(2, '2.1', '集合概述',         False, c + '2.1集合概述/sets.html')
add(2, '2.2', '幂集',             False, c + '2.2幂集/powerset.html')
add(2, '2.3', '集合运算',         False, c + '2.3集合运算/set-theory.html')
add(2, '2.4', '集合运算的性质',   False, c + '2.4集合运算的性质/setprops.html')
add(2, '2.5', '集合的划分与覆盖', False, c + '2.5集合的划分与覆盖/partition.html')
add(2, '2.6', '容斥原理',         False, c + '2.6容斥原理/inclusion.html')
add(2, '2.7', '中秋案例',         True,  c + '2.7中秋案例/midautumn.html')
add(2, '2.8', '园林景观案例',     True,  c + '2.8园林景观案例/garden.html')
add(2, '2.9', '社区服务案例',     True,  c + '2.9社区服务/community.html')
add(2, '2.10', '科技创新案例',    True,  c + '2.10科技创新/tech_team.html')
# ---- 第3章 ----
c = '3二元关系/'
add(3, '3.1', '笛卡尔积和二元关系', False, c + '3.1笛卡尔积和二元关系/relations.html')
add(3, '3.2', '特殊关系',           False, c + '3.2特殊关系/special_relations.html')
add(3, '3.3', '二元关系的表示',     False, c + '3.3二元关系的表示/representation.html')
add(3, '3.4', '二元关系的运算',     False, c + '3.4二元关系的运算/1）整体综合/relation_ops.html',
    tiers=[c + '3.4二元关系的运算/2）逆运算/inverse.html',
           c + '3.4二元关系的运算/1）整体综合/relation_ops.html',
           c + '3.4二元关系的运算/4）幂运算/power.html'])
add(3, '3.5', '二元关系的性质',     False, c + '3.5二元关系的性质/properties.html')
add(3, '3.6', '二元关系的闭包',     False, c + '3.6二元关系的闭包/closures.html')
add(3, '3.7', '社区案例',           True,  c + '3.7社区案例/community_service.html')
add(3, '3.8', '祖先案例',           True,  c + '3.8祖先案例/ancestry.html')
add(3, '3.9', '湖湘知识图谱案例',   True,  c + '3.9湖湘知识图谱案例/hunan_culture.html')
add(3, '3.10', '大学生职业规划案例', True, c + '3.10大学生职业规划/career_path.html')
# ---- 第4章（目录名无章号前缀，按顺序编号） ----
c = '4特殊关系/'
add(4, '4.1', '相容和等价关系',     False, c + '1.相容和等价关系/compatibility.html')
add(4, '4.2', '偏序关系',           False, c + '2.偏序关系/hasse_diagram.html')
add(4, '4.3', '全序、良序和拟序',   False, c + '3全序、良序和拟序/order_relations.html')
add(4, '4.4', '函数基本概念',       False, c + '4函数基本概念/functions.html')
add(4, '4.5', '三种类型函数',       False, c + '5三种类型函数/function_properties.html')
add(4, '4.6', '特殊类型的函数',     False, c + '6特殊类型的函数/special_functions.html')
add(4, '4.7', '函数的运算',         False, c + '7函数的运算/function_operations.html')
add(4, '4.8', '无限集合',           False, c + '8无限集合/infinite_sets.html')
add(4, '4.9', '社会网络群体案例',   True,  c + '9社会网络群体案例/social_network.html')
add(4, '4.10', '官职排序案例',      True,  c + '10官职排序案例/official_hierarchy.html')
add(4, '4.11', '春节返乡人口流动案例', True, c + '11春节返乡人口流动案例/chunyun_migration.html')
add(4, '4.12', '地理信息处理系统案例', True, c + '12地理信息处理系统案例/heritage_gis.html')
add(4, '4.13', '探索宇宙边界的天文模拟案例', True, c + '13探索宇宙边界的天文模拟案例/universe_exploration.html')
# ---- 第5章 ----
c = '5命题逻辑/'
add(5, '5.1', '命题与联结词',         False, c + '1命题与联结词/logic_propositions.html')
add(5, '5.2', '命题公式定义与符号化', False, c + '2命题公式定义与符号化/propositional_formulas.html')
add(5, '5.3', '命题公式解释与真值表', False, c + '3命题公式解释与真值表/formula_interpretation.html')
add(5, '5.4', '命题公式之间的关系',   False, c + '4命题公式之间的关系/compatibility_equivalence.html')
add(5, '5.5', '对偶与范式',           False, c + '5对偶与范式/normal_forms.html')
add(5, '5.6', '命题演算推证',         False, c + '6命题演算推证/inference_proof.html')
add(5, '5.7', '命题推理系统及性质',   False, c + '7命题推理系统及性质/system_properties.html')
add(5, '5.8', '两弹一星案例',         True,  c + '8两弹一星案例/two_bombs_logic.html')
add(5, '5.9', '人工智能创新案例',     True,  c + '9人工智能创新/deep_learning_logic.html')
# ---- 第6章 ----
c = '6谓词逻辑/'
add(6, '6.1', '自然语言的谓词符号化', False, c + '6.1自然语言的谓词符号化/tokenization.html')
add(6, '6.2', '谓词公式的解释',       False, c + '6.2谓词公式之间的解释/predicate_formula.html')
add(6, '6.3', '谓词公式的类型',       False, c + '6.3谓词公式之间的类型/formula_interpretation.html')
add(6, '6.4', '谓词公式之间的关系',   False, c + '6.4谓词公式之间的关系/formula_relations.html')
add(6, '6.5', '前束范式',             False, c + '6.5前束范式/prenex_normal_form.html')
add(6, '6.6', '谓词逻辑有效推理',     False, c + '6.6谓词逻辑有效推理/inference_rules.html')
add(6, '6.7', '谓词逻辑推理系统及性质', False, c + '6.7谓词逻辑推理系统及性质/inference_system_properties.html')
add(6, '6.8', '个人进步和国家发展案例', True, c + '6.8个人进步和国家发展案例/career_recommend.html')
add(6, '6.9', '国家历史文化遗产保护案例', True, c + '6.9国家历史文化遗产保护/heritage_protection.html')
# ---- 第7章 ----
c = '7图论基础/'
add(7, '7.1', '图的基本概念', False, c + '7.1图的基本概念/graph_theory.html')
add(7, '7.2', '顶点的度',     False, c + '7.2顶点的度/vertex_degree.html')
add(7, '7.3', '图同构',       False, c + '7.3图同构/graph_isomorphism.html')
add(7, '7.4', '几种典型的图', False, c + '7.4几种典型的图/typical_graphs.html')
add(7, '7.5', '图的运算',     False, c + '7.5图的运算/graph_operations.html')
add(7, '7.6', '连通性基础',   False, c + '7.6连通性基础/graph_paths_circuits.html')
add(7, '7.7', '图的矩阵表示', False, c + '7.7图的矩阵表示/graph_matrix_representation.html')
add(7, '7.8', '最短通路',     False, c + '7.8最短通路/shortest_path_algorithms.html')
add(7, '7.9', '连通性进阶',   False, c + '7.9连通性进阶/graph_connectivity.html')
add(7, '7.10', '灾害响应调度案例',   True, c + '7.10灾害响应调度案例/rescue-dijkstra-index.html')
add(7, '7.11', '城市交通网络优化案例', True, c + '7.11城市交通网络优化案例/traffic-optimization-index.html')
add(7, '7.12', '智能制造网络分析案例', True, c + '7.12智能制造网络分析案例/manufacturing-matrix-index.html')
add(7, '7.13', '智慧城市综合管理系统设计案例', True, c + '7.13智慧城市综合管理系统设计案例/smart-city-index.html')
# ---- 第8章 ----
c = '8特殊图/'
add(8, '8.1', '欧拉图',       False, c + '8.1欧拉图/euler-index.html')
add(8, '8.2', '哈密顿图',     False, c + '8.2哈密顿图/hamiton.html')
add(8, '8.3', '二部图',       False, c + '8.3二部图/partgraph-index.html')
add(8, '8.4', '平面图',       False, c + '8.4平面图/index.html')
add(8, '8.5', '树的基本概念', False, c + '8.5树的基本概念/index.html')
add(8, '8.6', '生成树', False, c + '8.6生成树1/bfs-index.html', part='搜索生成树')
add(8, '8.6', '生成树', False, c + '8.6生成树2/mst-index.html', part='最小生成树')
add(8, '8.7', '根树',   False, c + '8.7根树1/tree-types-index.html', part='二叉树类型')
add(8, '8.7', '根树',   False, c + '8.7根树2/huffman-index.html', part='哈夫曼编码')
add(8, '8.8', '古镇修复路径案例',       True, c + '8.8古镇修复路径案例/index.html')
add(8, '8.9', '大学生志愿配对案例',     True, c + '8.9大学生志愿配对案例/index.html')
add(8, '8.10', '智慧城市交通规划案例',  True, c + '8.10智慧城市交通规划案例/planar-index.html')
add(8, '8.11', '湖南省文化遗产数字化案例', True, c + '8.11湖南省文化遗产数字化案例/hunan-mst-index.html')
add(8, '8.12', '航天通信网络案例',      True, c + '8.12航天通信网络案例/aerospace-mst-index.html')
add(8, '8.13', '智能农业监测案例',      True, c + '8.13智能农业监测案例/agriculture-index.html')
# ---- 第9章 ----
c = '9代数系统/'
add(9, '9.1', '代数系统的定义',   False, c + '9.1定义/algebraic_systems.html')
add(9, '9.2', '运算定律',         False, c + '9.2定律/algebraic_laws.html')
add(9, '9.3', '特殊元素',         False, c + '9.3特殊元素/special_elements.html')
add(9, '9.4', '代数系统的分类',   False, c + '9.4代数系统/algebraic_system_types.html')
add(9, '9.5', '子代数和积代数',   False, c + '9.5子代数和积代数/isomorphism_and_homomorphism.html')
add(9, '9.6', '同态与同构', False, c + '9.6同态与同构/homomorphism_types.html', part='同态的类型')
add(9, '9.6', '同态与同构', False, c + '9.6同态与同构/homomorphism_isomorphism_system.html', part='同构判定台')
add(9, '9.7', '劳动教育成效评估案例',   True, c + '9.7劳动教育成效评估案例/labor_education_evaluation.html')
add(9, '9.8', '社区共享资源优化管理案例', True, c + '9.8社区共享资源优化管理案例/shared_resources.html')
add(9, '9.9', '湖湘织锦数字化保护案例', True, c + '9.9湖湘织锦数字化保护案例/huxiang_brocade_complete.html')
add(9, '9.10', '智能制造工艺流程案例', True, c + '9.10智能制造工艺流程案例/smart_manufacturing_optimization.html')
add(9, '9.11', '传统文化艺术品数字化案例', True, c + '9.11传统文化艺术品数字化案例/cultural_heritage_digitalization.html')
# ---- 第10章 ----
c = '10群论基础/'
add(10, '10.1', '群的定义及性质',   False, c + '10.1群定义及性质/algebra-index.html')
add(10, '10.2', '群的阶和子群',     False, c + '10.2群的阶和子群/group-order-index.html')
add(10, '10.3', '群同态和同构',     False, c + '10.3群同态和同构/homomorphism-index.html')
add(10, '10.4', '特殊类型群', False, c + '10.4特殊类型群1/special-groups-index.html', part='循环群与对称群')
add(10, '10.4', '特殊类型群', False, c + '10.4特殊类型群2/permutation-index.html', part='置换群')
add(10, '10.5', '陪集和拉格朗日定理', False, c + '10.5陪集和拉格朗日定理/cosets-index.html')
add(10, '10.6', '正规子群和商群',   False, c + '10.6正规子群和商群/normal-subgroups-index.html')
add(10, '10.7', '北斗导航加密算法案例',   True, c + '10.7北斗导航加密算法案例/beidou-rs-index.html')
add(10, '10.8', '密码学中对称群应用案例', True, c + '10.8密码学中对称群应用案例/coset-crypto-index.html')
add(10, '10.9', '密钥生成方案案例',       True, c + '10.9密钥生成方案案例/key-generation-index.html')
# ---- 第11章 ----
c = '11环、域、格和布尔代数/'
add(11, '11.1', '环的定义和性质',   False, c + '11.1定义和性质/ring_theory.html')
add(11, '11.2', '子环、理想和商环', False, c + '11.2子环、理想和商环/ring-theory.html')
add(11, '11.3', '环同态和同构',     False, c + '11.3环同态和同构/homomorphism.html')
add(11, '11.4', '格的定义及性质',   False, c + '11.4格定义及性质/lattice.html')
add(11, '11.5', '子格和格同态',     False, c + '11.5子格和格同态/lattice-index.html')
add(11, '11.6', '特殊格',           False, c + '11.6特殊格/lattice-types.html')
add(11, '11.7', '布尔代数',         False, c + '11.7布尔代数/boolean_algebra.html')
add(11, '11.8', '基于环的纠错线性码案例', True, c + '11.8基于环的纠错线性码案例/linear-code-index.html')
add(11, '11.9', '环同态加密系统案例',     True, c + '11.9环同态加密系统案例/homomorphic_encryption.html')
add(11, '11.10', '格在形式概念分析案例', True, c + '11.10格在形式概念分析案例/fca_visualization.html')
add(11, '11.11', '逻辑电路表达式案例',   True, c + '11.11逻辑电路表达式案例/boolean-circuit-index.html')

UNITS = U
CH = {c[0]: dict(n=c[0], name=c[1], cat=c[2], dir=c[3], domain=c[4]) for c in CHAPTERS}

def tier_paths(u):
    """返回 (基础层, 进阶层, 拓展层) 三个页面相对路径。"""
    if u['tiers']:
        return tuple(u['tiers'])
    stem = u['path'][:-5]
    return (stem + '-basic.html', u['path'], stem + '-extend.html')

def display_name(u):
    return u['name'] + (' · ' + u['part'] if u['part'] else '')

def section_label(u):
    """面包屑/页面标题中的小节标签：N.M 名称[ · 分部]"""
    return u['num'] + ' ' + display_name(u)

def chapter_label(n):
    return '第%d章 %s' % (n, CH[n]['name'])

def all_pages():
    """(相对路径, 单元, 层索引0/1/2)"""
    out = []
    for u in UNITS:
        for i, p in enumerate(tier_paths(u)):
            out.append((p, u, i))
    return out

if __name__ == '__main__':
    miss = [p for p, u, i in all_pages() if not os.path.exists(os.path.join(SITE_DIR, p))]
    print('单元', len(UNITS), '页面', len(all_pages()), '缺失', miss)
    print('案例单元', sum(u['case'] for u in UNITS))
    fs = {os.path.relpath(os.path.join(d, f), SITE_DIR) for d, _, fl in os.walk(SITE_DIR) for f in fl if f.endswith('.html')}
    known = {p for p, _, _ in all_pages()} | {'index.html'}
    print('未登记页面', sorted(fs - known))
