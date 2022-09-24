import { View, Text, Animated, TouchableOpacity, StyleSheet, ScrollView } from 'react-native'
import React, {useEffect} from 'react'
import MakamCard from '../components/MakamCard'


const Makams = ({language, theme}) => {
  
  //const B = (props) => <Text style={{fontWeight: 'bold'}}>{props.children}</Text>

  //randomize the list here so wont need to choose a random color for each makam component (its not what i wanted here, gonna check)
  let COLOR_PALETTE_1 = [
    "FEF9A7", "FAC213", 
    "F77E21", "D61C4E", 
    "990000", "FF5B00", 
    "D4D925", "FFEE63"].sort(() => Math.random() - 0.5)

  const MAKAMS = {
    hicaz: {
      makamName: 'Hicaz',
      info: `Durağı: Dügâh perdesidir. 
Seyri: İnici-çıkıcı, bâzen de çıkıcı olarak kullanılmıştır.
Dizisi: Yerinde Hicaz dörtlüsününe Nevâ’da bir Rast beşlisinin eklenmesinden meydana gelmiştir.
Güçlüsü: Hicaz dörtlüsü ile Rast beşlisinin ek yerindeki 5. derece Nevâ perdesidir. Üzerinde Rast çeşnisi ile yarım karar yapılır.
Donanımı: Si için bakiye bemolü, fa ve do için bakiye diyezi donanıma yazılır.
Perdelerin T.M.deki isimleri: Dügâh, Dik Kürdi, Nim Hicaz, Nevâ, Hüseyni, Eviç, Gerdaniye ve Muhayyer’dir.
Yedeni: 2.çizgideki sol Rast perdesidir (Bâzı klâsiklerde nâdir de olasa Nim Zirgüle kullanılmıştır).
Dizinin seyri:İnici-çıkıcı seyre sahip olan Hicaz makamının seyrine Nevâ perdesi civarından başlanır. Bazen dizinin alt ve üst tarafından başlayan eserler yapılmışsa da, bu diziler de hemen orta seslere geçmiştir. Hicaz dörtlüsünün sesleri verilerek güçlü olan Nevâ perdesinde kalış yapılır. Sonra dizinin üst tarafında bulunan Rast beşlisinin seslerine geçilir. Tiz Duraktan, Güçlüye doğru inilirken genellikle Fa diyez (Evç perdesi) bekar yapılarak Acem perdesi haline getirilir. Bu şekilde inici olarak Nevâ’da bir Bûselik Beşlisi meydana gelmiş olur. Güçlü perdesinde kalış gösterilerek, karışık seslerle Hicaz dörtlüsünde gezinilerek Dügâh perdesinde karar verilir.
`,
    },
    nihavend: {
      makamName:'Nihavend',
      info:`Durağı: Rast perdesidir.
Seyri: İnici-çıkıcıdır. Bâzen çıkıcı, bâzen de inici gibi seyre başlarsa da, hemen çıkıcı-inici hâle döner.   
Güçlüsü: Neva perdesidir.
Yeden: Irak perdesidir.
Donanımı: Si ve mi küçük mücenneb bemolü donanıma yazılır. Gerekli diğer değişiklikler eser içinde gösterilir.
Perdelerin T.M.deki isimleri: Rast, Dügâh, Kürdi, Çargâh, Nevâ, Nim Hisâr, Acem, Gerdâniye’dir. Nevâ’da Hicaz olduğu zaman Nevâ, Hisâr, Eviç, Gerdâniye perdeleri kullanılır.
Dizinin Seyri: İnici-çıkıcı seyre sahip olan Nihavend makamını seyrine genellikle orta seslerden başlanır. Dizini son derece kullanılabilir olaması nedeniyle çok çeşitli seslerde-dizilerde dolaşılabilir. Genellikle Nevâ perdesi üzerindeki Kürdi veya Hicaz Dörtlüsünün sesleri kullanılarak Güçlü sesi olan Nevâ perdesinde asma karar yapılır.
Genişleme sesleri olan Bûselik Beşlisinin sesleri kullanılarak tiz seslerde dolaşılır. Yukarıdan aşağıya inilerek, çeşitli geçkilerle Nevâ perdesinde tekrar kalış gösterilir. Dizinin orta seslerinde dolaşılır.
Karara doğru Bûselik’li olarak inilir. Dizi alt taraftan Hicaz’lı olarak genişleme yapar. Bûselik Beşlisinin sesleri ile yeden olan Irak Perdesi de belirtilerek Rast Perdesinde karar verilir.
`,
    },
    ussak: {
      makamName: 'Uşşak',
      info: `Durağı: Dügâh perdesidir.
Seyri: Çıkıcıdır.
Dizisi: Yerinde Uşşak dörtlüsüne Nevâ’da Bûselik beşlisinin eklenmesinden meydana gelmiştir.
Güçlüsü: Dörtlü ile beşlinin ek yerindeki Nevâ (re) perdesidir. Üzerinde Bûselik çeşnili yarım karar yapılır.
Yedeni: Rast perdesidir.
Donanımı: Yalnız si için koma bemolü donanıma yazılır.
Dizinin Seyri:Uşşak makamı da Rast makamı gibi ağır yapılı bir makamdır.Çıkıcı diziye sahip olduğundan,seyre durak perdesi civarından başlanır. Uşşak dörtlüsünün sesleri kullanılarak Güçlü olan Nevâ perdesinde asma kalış yapılır.
Perdelerin T.M.deki isimleri: Dügâh, Segâh, Çargâh, Nevâ, Hüseyni, Acem, Gerdâniye ve Muhayyer’dir.
Genişlemesi: Uşşak makamı dizisi alt tarafından genişleme yapar.Genişleme Yegâh perdesindeki Rast Beşlisiyle olur. Dizinin seslerinde karışık olarak gezindikten sonra Nevâ’da asma kalış yapılır. Karar gidilirken özellikle Segâh perdesinde kalış gösterilir. Uşşak dörtlüsünün sesleri kullanılarak Dügâh perdesinde karar verilir.
Makamın Özelliği:Uşşak makamı dizisinin ikinci sesi olan Segâh perdesi donanımında gösterildiği gibi 1 koma olarak icra edilmez. Daima 2-3 perde pes icra edilir. Uşşak makamına bu perde ayrı bir özellik verir. Bu ses müzikologlar tarafından şekillendirilmediğinden, biz de koma bemolü ile gösteriyoruz.
`
    },
    kurdi: {
      makamName: 'Kürdi',
      info: `Durağı: Dügâh perdesidir.
Seyri: Çıkıcıdır.
Dizisi: Yerinde Kürdi dörtlüsüne Nevâ perdesinde Bûselik Beşlisinin eklenmesinden meydana gelmiştir.
Güçlüsü: Dörtlü ile beşlinin ek yerindeki Nevâ perdesidir; üzerinde Bûselik çeşnisi bulunur.
Yeden’i: 2.çizgideki sol (Rast) perd’esidir. Bazen Nim Zirgüle’de kullanılır.
Donanımı: Si için küçük mücenneb bemolü donanıma yazılır.
Perdelerin T.M.deki isimleri: Dügâh, Kürdi, Çargâh, Nevâ, Hüseyni, Acem, Gerdaniye, Muhayyer’dir.
Dizinin seyri:Kürdi makamı en az kullanılmış olan makamlarımızdan birisidir. Ağır yapılı bir makamdır. Mevcut eserleri incelediğimiz zaman, bu makam seslerinin genellikle kendi dizisinde dolaştığını görürüz.
Durak sesi civarından seyre başlanarak Kürdi Dörtlüsünün sesleri verilir. Neva perdesinde asma kalış yapılır. Sonra dizinin üst tarafında bulunan Bûselik Beşlisinin seslerine geçilir. Tiz duraktan aşağıya inilirken Nevâ’da Hicaz yapılabilir.
Güçlü’de tekrar kalış gösterildikten sonra Dügâh perdesine inilirken Hicaz Dörtlüsünün sesleri de verilebilir.Ancak bitiş, Kürdi dörtlüsünün sesleri yapılır. Tam karar Dügâh perdesinde yapılır.`
    },
    rast: {
      makamName: 'Rast',
      info: `Durağı: Rast perdesidir.
Seyri: Çıkıcıdır.
Dizisi: Yerinde Rast beşlisine Nevâ’da bir Rast dörtlüsünün eklenmesinden meydana gelmiştir.
Güçlüsü: Neva perdesidir.
Yeden:Irak perdesidir.
Donanımı: Si için koma bemolü, fa için bakiye diyezi donanıma konulur.
Perdelerin T.M.deki isimleri: Rast, Dügâh, Segâh, Çargâh, Nevâ, Hüseyni, Eviç veya Acem, Gerdâniye.
Dizinin Seyri:Çıkıcı seyre sahip olan Rast makamının seyrine Durak sesi civarından başlanır. Dizi alt taraftan genişlemiştir. Çoğu kez bu genişleme seslerinden seyre başlanır. Rast beşlisinin sesleri kullanılarak Neva perdesinde asma kalış yapılır.
Daha sonra dizinin üst tarafında bulunan Rast Dörtlüsünün seslerine geçilir. Ancak çoğunlukla çıkışta kullanılan Evç perdesi inici nağmelerde kullanılan Acem perdesi haline dönüşür. Tekrar Nevâ’da kalış yapılır. Yerinde Rast Beşlisi’nin seslerine geçilerek çeşitli seslerde, özellikle Segâh perdesinde asma kalışlar yapılabilir. Bitiş, Rast Beşlisinin sesleri ile Rast perdesinde çoğunlukla yedenli olarak yapılır.`
    },
    karcigar: {
      makamName: 'Karcığar',
      info: `Durağı: Dügâh perdesidir.
Seyri: İnici-çıkıcıdır.
Dizisi: Yerinde Uşşak dörtlüsüne Nevâ perdesinde Hicaz beşlisinin eklenmesinden meydana gelmiştir.
Güçlüsü: Uşşak dörtlüsü ile Hicaz beşlisinin ek yerindeki Nevâ perdesidir. Üzerinde Hicaz çeşnili yarım karar yapılır.
Yeden’i: 2.çizgideki sol Rast perdesidir.
Donanımı: Si için koma bemolü, mi için bakiye bemolü, fa için bakiye diyez donanım yazılır.
Perdelerin T.M.deki isimleri: Dügâh, Segâh, Çargâh, Nevâ, Hisâr, Eviç, Gerdaniye, Muhayyer’dir.
Dizinin seyri: Seyre Güçlüsü olan Nevâ perdesi civarından başlanır. Alt seslerden başlayan seyirlerde de hemen orta seslere geçilir. Dizinin muhtelif seslerinde dolaşılarak Güçlü olan Nevâ perdesinde asma kalış yapılır.
Ancak, Karcığar makamının karakteristik asma kalış perdesi Çargâh perdesidir. Bu nedenle Güçlü perdesinde kalış her zaman gösterilmez.Çargâh perdesinde güçlü gibi kalış gösterilir. Bu şekilde Çargâh perdesindeki kalış Nikriz Beşlisi adını alır.
Dizinin seslerinde dolaşılarak, Uşşak Dörtlüsünün sesleri kullanılarak Dügâh perdesinde karar verilir.Makamın Özelliği:Yukarıdaki dizide de görüldüğü gibi, Gerdaniye perdesi üzerinde bir Bûselik Beşlisi yapılmaktadır. Karcığar makamı dizisi alttan genişlemez. Üst kısımda ise yukarıda görüldüğü gibi genişler.
Karcığar makamının asma kararı, dörtlü ile beşlinin birleştiği yerde değildir. Asma karar Çargâh perdesidir.`
    },
    kurdilihicazkar: {
      makamName: 'Kürdilihicazkar',
      info: `Durağı: Rast perdesidir.
Seyri: İnicidir.
Güçlüsü: Gerdaniye perdesidir.(İkinci derecede Çargâh)
Yeden: Acem Aşiran perdesidir.
Donanım: Si,mi,lâ için küçük mücennep bemolü donanıma yazılır.
Dizinin Seyri: İnici bir seyre sahip olan Kürdili Hicazkâr makamının seyrine ekseriya Tiz Durak (Gerdaniye) civarından başlanır. Hicazkâr makamı gibi başlayan eserler de çoğunluktadır. Hattâ Hicazkâr makamının bütün dizisi icra edilebilir. Nevâ’da Bayâti makamı dizisi ve Çargâh perdesindeki Rast Beşlisinin sesleriyle meydana gelen Arazbar makamı seyri ile de başlayan Kürdili Hicazkâr eserler vardı.
Asma Karar Perdeleri: Asma karar perdesi olarak en önemli perde ana dizinin ek yerindeki Çargâh perdesidir. Yukarıda da belirtildiği gibi bu perde üzerinde Bûselik çeşnisiyle asma karar yapılır. Nevâ perdesi üzerinde Kürdi çeşnisiyle önemli asma kararlar yapılır.
Çok parlak ve renkli nağmelerin yapıldığı Kürdili Hicazkâr makamının seyri yapılırken, Gerdaniye üzerindeki Kürdi ve Hicaz’lı kalışlar bu makamın karakteristik özelliğidir. Dizinin diğer sesleri kullanılarak Neva’da Bayâti’li kalış yapılır. Ana dizinin sesleri kullanılarak Kürdi Dörtlüsünün sesleri ile Rast perdesinde karar verilir.`
    },
    segah: {
      makamName: 'Segâh',
      info: `Durağı: Segâh perdesidir.
Seyri: Çıkıcıdır.
Güçlü: Nevâ perdesidir.
Yeden: Kürdi perdesidir.
Donanımı: Si ve mi için koma bemolü, fa için bakiye diyezi donanıma yazılır.Gerekli değişiklikler eser içinde gösterilir.
Dizisi: Segâh makamı dizisi, Segâh perdesi üzerindeki Segâh Beşlisine, Hicaz Dörtlüsünün eklenmesiyle meydana gelir.
Segâh makamı için gerekli olan Segâh Beşlisi (STKT) özelliği olan bir Beşlidir. Hüzzam makamına yakınlığı vardır. Ancak etkisi daha hafif, daha parlaktır.
Seyri: Segâh makamının seyrine, Durak sesi civarından başlanır.Segâh Beşlisinin sesleri kullanılarak Nevâ perdesinde asma kalış yapılır. Segâh Beşlisinin sesleri kullanılarak Evç perdesi üzerinde bulunan Hicaz Dörtlüsünün seslerine geçilir. İnici hallerde Evc perdesi genellikle Bekar yapılarak Acem perdesi haline dönüşür.
Segâh makamı seyri yapılırken muhtelif geçkiler yapılabilir. Segâh Beşlisinin seslerinde ısrarlı dolaşılır. Segâh Beşlisinin sesleri kullanılarak Segâh perdesinde bazen Yedeni olan Kürdi perdesi de belirtilerek karar verilir.`
    },
    huzzam: {
      makamName: 'Hüzzam',
      info: `Durağı: Segâh perdesidir.
Seyri: İnici-çıkıcıdır.
Güçlüsü: Nevâ perdesidir.
Yeden: Kürdi perdesidir.
Donanımı: Si için koma bemolü, mi için bakiye bemolü, fa için bakiye diyezi donanıma yazılır.
Dizisi: Hüzzam makamı dizisi, yerinde Hüzzam Beşlisine, Neva perdesinde Hicaz Dörtlüsünün eklenmesiyle meydana gelir.
Seyri: Hüzzam makamının seyrine genellikle Güçlü sesi civarından başlanır. Hüzzam Beşlisinin seslerinde dolaşılarak Neva perdesinde asma kalış gösterilir.Neva perdesi üzerinde bulunan Hümayûn dizisinin seslerine geçilerek bu seslerde dolaşılır.Muhtelif perdeler üzerinde kalışlar yapılabilir. Tekrar Neva perdesinde inilerek bu perdede asma kalış yapılır.
Hüzzam Beşlisine geçilerek, bu dizinin sesleri ile, Yedeni olan Kürdi perdesi de gösterilmek suretiyle Segâh perdesinde karar verilir.`
    }


  }

  // could refactor and render from a list via map etc (image linking wont work, need a sol)
  return (
    <View style={[styles.container, {backgroundColor:theme == 'Dark' ? '#2c1a31' : 'white'}]}>
      <ScrollView contentContainerStyle={{flexGrow:1 }}>
        <MakamCard 
          makamName={MAKAMS.hicaz.makamName}
          makamInfo={MAKAMS.hicaz.info}
          imageURI={require("../assets/makams/hicaz.jpg")}
          color={COLOR_PALETTE_1[0]}
          />
        <MakamCard 
          makamName={MAKAMS.nihavend.makamName}
          makamInfo={MAKAMS.nihavend.info}
          imageURI={require("../assets/makams/nihavend.jpg")}
          color={COLOR_PALETTE_1[1]}
          />
        <MakamCard 
          makamName={MAKAMS.ussak.makamName}
          makamInfo={MAKAMS.ussak.info}
          imageURI={require("../assets/makams/ussak.jpg")}
          color={COLOR_PALETTE_1[2]}
          />
        <MakamCard 
          makamName={MAKAMS.kurdi.makamName}
          makamInfo={MAKAMS.kurdi.info}
          imageURI={require("../assets/makams/kurdi.jpg")}
          color={COLOR_PALETTE_1[3]}
          />
        <MakamCard 
          makamName={MAKAMS.rast.makamName}
          makamInfo={MAKAMS.rast.info}
          imageURI={require("../assets/makams/rast.jpg")}
          color={COLOR_PALETTE_1[4]}
          />
        <MakamCard 
          makamName={MAKAMS.karcigar.makamName}
          makamInfo={MAKAMS.karcigar.info}
          imageURI={require("../assets/makams/karcigar.jpg")}
          color={COLOR_PALETTE_1[5]}
          />
        <MakamCard 
          makamName={MAKAMS.kurdilihicazkar.makamName}
          makamInfo={MAKAMS.kurdilihicazkar.info}
          imageURI={require("../assets/makams/kurdilihicazkar.jpg")}
          color={COLOR_PALETTE_1[6]}
          />
        <MakamCard 
          makamName={MAKAMS.segah.makamName}
          makamInfo={MAKAMS.segah.info}
          imageURI={require("../assets/makams/segah.jpg")}
          color={COLOR_PALETTE_1[7]}
          />
        <MakamCard 
          makamName={MAKAMS.huzzam.makamName}
          makamInfo={MAKAMS.huzzam.info}
          imageURI={require("../assets/makams/huzzam.jpg")}
          color={COLOR_PALETTE_1[0]}
          />
 

      </ScrollView>
    </View>
  )
}

export default Makams

const styles = StyleSheet.create({
  container:{
    width:'100%',
    height:'100%',
  },
  optionLabel:{
    width:'90%',
    height: 40,
    backgroundColor:'crimson',
    borderRadius: 10,
    marginBottom: 5,
    marginTop: 5
  }

})