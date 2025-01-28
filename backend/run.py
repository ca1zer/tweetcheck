from app import create_app
from app.graph_builder import build_graph, calculate_pagerank, save_daily_metrics
import sqlite3
import os

app = create_app()

SEED_NODES = [
    "951329744804392960", # solana
    "44196397", # elonmusk
    "1476422418176659457", # Web3Alerts
    "1476395269705154560", # Web3AlertsTrack
    "902926941413453824", # cz_binance
    "877807935493033984", # binance
    "973261472", # blknoiz06
    "1830340867737178112", # shawmakesmagic
    "2312333412", # ethereum
    "295218901", # VitalikButerin
    "2327407569", # aeyakovenko
    "1851849397979480064", # ai16zdao
    "1441835930889818113", # frankdegods
    "574032254", # coinbase
    "1052454006537314306", # BNBCHAIN
    "3012852462", # zachxbt
    "1395504028910424065", # LayerZero_Core
    "2260491445", # CoinMarketCap
    "1628067904083181570", # base
    "1387497871751196672", # WatcherGuru
    "357312062", # Bitcoin
    "1325739682752204800", # traderpow
    "1395261244769112065", # _RichardTeng
    "844304603336232960", # MustStopMurad
    "999947328621395968", # Bybit_Official
    "1852674305517342720", # aixbt_agent
    "1802642686710837249", # truth_terminal
    "14379660", # brian_armstrong
    "1379053041995890695", # phantom
    "1426732252768182281", # notthreadguy
    "2259434528", # cobie
    "1622243071806128131", # pumpdotfun
    "1651199844365766656", # sendaifun
    "2733200058", # deepseekcto
    "2902349190", # TheRoaringKitty
    "1163550920485015558", # ethdotorg
    "101833150", # rajgokal
    "944686196331966464", # HsakaTrades
    "867617849208037377", # okx
    "2412652615", # coingecko
    "1446489618208067586", # JupiterExchange
    "1432635656161746947", # boldleonidas
    "983993370048630785", # CryptoHayes
    "1309886201944473600", # 0xMert_
    "18876842", # jessepollak
    "5943622", # pmarca
    "1762471547485184000", # cookiedotfun
    "1003840309166366721", # heyibinance
    "1424905944857722887", # SOLBigBrain
    "1333467482", # CoinDesk
    "1449140157903482882", # BRICSinfo
    "1851730950566350850", # griffaindotcom
    "1051852534518824960", # inversebrah
    "2361601055", # tier10k
    "588569122", # wallstreetbets
    "1542947918709080065", # eigenlayer
    "946213559213555712", # opensea
    "1614020914563407872", # term_labs
    "1433121559057559555", # MagicEden
    "914738730740715521", # 0xPolygon
    "2207129125", # Cointelegraph
    "1714580962569588736", # deepseek_ai
    "1852499847133143040", # remarks
    "79714172", # zhusu
    "1282727055604486148", # News_Of_Alpha
    "333357345", # Cobratate
    "1738717256169783296", # ponkesol
    "1202781705683255296", # khouuba
    "1138993163706753029", # Pentosh1
    "911011433147654144", # TrustWallet
    "1407290555344769030", # Cookie3_com
    "1866789219613421568", # agentcookiefun
    "1358454920299433985", # RaydiumProtocol
    "912539725071777792", # gate_io
    "1305349277422477313", # PancakeSwap
    "1470958472409792515", # a1lon9
    "1446541960181858315", # based16z
    "1138033434", # Rewkang
    "978566222282444800", # MEXC_Official
    "1044836083530452992", # Optimism
    "1319287761048723458", # MarioNawfal
    "244647486", # saylor
    "1289071298556170240", # GiganticRebirth
    "20006785", # AndyAyrey
    "1332033418088099843", # arbitrum
    "902839045356744704", # justinsuntron
    "914029581610377217", # HTX_Global
    "2371575838", # sibeleth
    "1527020295059648513", # HyperliquidX
    "984188226826010624", # Uniswap
    "9615352", # dwr
    "910110294625492992", # kucoincom
    "2446024556", # Tradermayne
    "2235729541", # dogecoin
    "887748030304329728", # TheCryptoDog
    "1572090499229487104", # ellipsis_labs
    "1456327895866314753", # Tree_of_Alpha
    "1061321268379746304", # nunooeu
    "2880164201", # smithiio
    "2199868461", # Euris_JT
    "2926713453", # ohbrox
    "86647812", # Ga__ke
    "1189381231198134272", # CookerFlips
    "1762266425589149696", # daumeneth
    "1121406190309847046", # 404flipped
    "1392124029914566666", # metaversejoji
]

def initialize_app():
    print(f"Current working directory: {os.getcwd()}")
    db_path = 'data/twitter.db'
    print(f"Database path: {os.path.abspath(db_path)}")
    
    if not os.path.exists(db_path):
        print(f"Error: Database file {db_path} does not exist!")
        return

    try:
        conn = sqlite3.connect(db_path)
        c = conn.cursor()
        
        user_count = c.execute('SELECT COUNT(*) FROM users').fetchone()[0]
        rel_count = c.execute('SELECT COUNT(*) FROM following_relationships').fetchone()[0]
        print(f"Database check: {user_count} users, {rel_count} relationships")
        
        conn.close()
    except Exception as e:
        print(f"Error connecting to database: {e}")
        return

    # G = build_graph()
    # scores = calculate_pagerank(G, seed_nodes=SEED_NODES)
    # save_daily_metrics(scores,G)

if __name__ == '__main__':
    with app.app_context():  
        initialize_app()
    app.run(debug=True, port=5000)
