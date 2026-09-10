import type { Grade, Word } from "./types";

export const CONTENT_VERSION = "topics-2026.1";

// Original starter content, independent of any textbook. Review before a formal study.
// Fields: word | Vietnamese target meaning | contextual example | translation | IPA.
const blocks: [Grade, string, string][] = [
  [6, "school", `classroom|phòng học|Our classroom is bright and clean.|Phòng học của chúng tôi sáng sủa và sạch sẽ.|/ˈklɑːsruːm/
notebook|vở ghi|I write new words in my notebook.|Tôi viết từ mới vào vở ghi.|/ˈnəʊtbʊk/
subject|môn học|English is my favourite subject.|Tiếng Anh là môn học yêu thích của tôi.|/ˈsʌbdʒɪkt/
library|thư viện|We read books in the library.|Chúng tôi đọc sách trong thư viện.|/ˈlaɪbrəri/
uniform|đồng phục|I wear a uniform to school.|Tôi mặc đồng phục đến trường.|/ˈjuːnɪfɔːm/
homework|bài tập về nhà|I do my homework after dinner.|Tôi làm bài tập về nhà sau bữa tối.|/ˈhəʊmwɜːk/`],
  [6, "daily", `breakfast|bữa sáng|I eat breakfast at seven.|Tôi ăn sáng lúc bảy giờ.|/ˈbrekfəst/
kitchen|nhà bếp|My father is in the kitchen.|Bố tôi đang ở trong bếp.|/ˈkɪtʃɪn/
bicycle|xe đạp|I ride my bicycle to school.|Tôi đạp xe đến trường.|/ˈbaɪsɪkl/
bedroom|phòng ngủ|There is a small desk in my bedroom.|Có một chiếc bàn nhỏ trong phòng ngủ của tôi.|/ˈbedruːm/
healthy|khỏe mạnh|Good food helps us stay healthy.|Thức ăn tốt giúp chúng ta khỏe mạnh.|/ˈhelθi/
quiet|yên tĩnh|The street is quiet at night.|Con phố yên tĩnh vào ban đêm.|/ˈkwaɪət/`],
  [6, "nature", `forest|rừng|Many birds live in this forest.|Nhiều loài chim sống trong khu rừng này.|/ˈfɒrɪst/
river|sông|A river runs through our village.|Một con sông chảy qua làng chúng tôi.|/ˈrɪvə/
mountain|núi|We can see a mountain from here.|Chúng tôi có thể nhìn thấy một ngọn núi từ đây.|/ˈmaʊntən/
beach|bãi biển|We play on the beach in summer.|Chúng tôi chơi trên bãi biển vào mùa hè.|/biːtʃ/
flower|hoa|This flower is yellow.|Bông hoa này màu vàng.|/ˈflaʊə/
weather|thời tiết|The weather is warm today.|Thời tiết hôm nay ấm áp.|/ˈweðə/`],
  [6, "community", `neighbour|hàng xóm|Our neighbour is very friendly.|Người hàng xóm của chúng tôi rất thân thiện.|/ˈneɪbə/
museum|bảo tàng|We visit the museum on Sunday.|Chúng tôi tham quan bảo tàng vào Chủ nhật.|/mjuˈziːəm/
market|chợ|My mother buys fruit at the market.|Mẹ tôi mua trái cây ở chợ.|/ˈmɑːkɪt/
friendly|thân thiện|Our new teacher is friendly.|Giáo viên mới của chúng tôi rất thân thiện.|/ˈfrendli/
village|làng|My grandparents live in a village.|Ông bà tôi sống ở một ngôi làng.|/ˈvɪlɪdʒ/
festival|lễ hội|Our town has a spring festival.|Thị trấn của chúng tôi có một lễ hội mùa xuân.|/ˈfestɪvl/`],
  [7, "school", `assignment|bài tập được giao|I finish my assignment before dinner.|Tôi hoàn thành bài được giao trước bữa tối.|/əˈsaɪnmənt/
semester|học kỳ|Our new semester starts in September.|Học kỳ mới của chúng tôi bắt đầu vào tháng Chín.|/sɪˈmestə/
laboratory|phòng thí nghiệm|We do experiments in the laboratory.|Chúng tôi làm thí nghiệm trong phòng thí nghiệm.|/ləˈbɒrətri/
timetable|thời khóa biểu|I check my timetable every morning.|Tôi kiểm tra thời khóa biểu mỗi sáng.|/ˈtaɪmteɪbl/
practise|luyện tập|We practise English every day.|Chúng tôi luyện tập tiếng Anh mỗi ngày.|/ˈpræktɪs/
improve|cải thiện|Reading can improve your vocabulary.|Đọc sách có thể cải thiện vốn từ vựng của bạn.|/ɪmˈpruːv/`],
  [7, "daily", `ingredient|nguyên liệu|Rice is the main ingredient in this dish.|Gạo là nguyên liệu chính trong món ăn này.|/ɪnˈɡriːdiənt/
recipe|công thức nấu ăn|This recipe is easy to follow.|Công thức này dễ làm theo.|/ˈresəpi/
exercise|tập thể dục|I exercise for thirty minutes each day.|Tôi tập thể dục ba mươi phút mỗi ngày.|/ˈeksəsaɪz/
allergy|dị ứng|She has an allergy to peanuts.|Bạn ấy bị dị ứng với lạc.|/ˈælədʒi/
hobby|sở thích|Painting is my favourite hobby.|Vẽ tranh là sở thích yêu thích của tôi.|/ˈhɒbi/
collect|sưu tầm|I collect stamps from different countries.|Tôi sưu tầm tem từ nhiều nước.|/kəˈlekt/`],
  [7, "nature", `environment|môi trường|We should protect the environment.|Chúng ta nên bảo vệ môi trường.|/ɪnˈvaɪrənmənt/
pollution|sự ô nhiễm|Air pollution is a serious problem.|Ô nhiễm không khí là một vấn đề nghiêm trọng.|/pəˈluːʃn/
recycle|tái chế|We recycle plastic bottles at school.|Chúng tôi tái chế chai nhựa ở trường.|/ˌriːˈsaɪkl/
energy|năng lượng|The sun gives us energy.|Mặt trời cho chúng ta năng lượng.|/ˈenədʒi/
wildlife|động vật hoang dã|This park is home to wildlife.|Công viên này là nơi sinh sống của động vật hoang dã.|/ˈwaɪldlaɪf/
rubbish|rác|Please put your rubbish in the bin.|Hãy bỏ rác vào thùng.|/ˈrʌbɪʃ/`],
  [7, "community", `volunteer|tình nguyện viên|My sister is a volunteer at the library.|Chị tôi là tình nguyện viên ở thư viện.|/ˌvɒlənˈtɪə/
charity|tổ chức từ thiện|We raise money for a local charity.|Chúng tôi quyên tiền cho một tổ chức từ thiện địa phương.|/ˈtʃærəti/
donate|quyên góp|We donate books to the village school.|Chúng tôi quyên góp sách cho trường làng.|/dəʊˈneɪt/
community|cộng đồng|We help people in our community.|Chúng tôi giúp đỡ mọi người trong cộng đồng.|/kəˈmjuːnəti/
performance|buổi biểu diễn|The music performance starts at eight.|Buổi biểu diễn âm nhạc bắt đầu lúc tám giờ.|/pəˈfɔːməns/
transport|phương tiện giao thông|Public transport can reduce traffic.|Giao thông công cộng có thể giảm lưu lượng xe.|/ˈtrænspɔːt/`],
  [8, "school", `concentrate|tập trung|I concentrate better in a quiet room.|Tôi tập trung tốt hơn trong phòng yên tĩnh.|/ˈkɒnsntreɪt/
experiment|thí nghiệm|Our class does a science experiment.|Lớp chúng tôi làm một thí nghiệm khoa học.|/ɪkˈsperɪmənt/
presentation|bài thuyết trình|I prepare a presentation about water.|Tôi chuẩn bị bài thuyết trình về nước.|/ˌpreznˈteɪʃn/
discuss|thảo luận|We discuss the story in groups.|Chúng tôi thảo luận câu chuyện theo nhóm.|/dɪˈskʌs/
solution|giải pháp|We need a solution to this problem.|Chúng tôi cần giải pháp cho vấn đề này.|/səˈluːʃn/
creative|sáng tạo|My friend has many creative ideas.|Bạn tôi có nhiều ý tưởng sáng tạo.|/kriˈeɪtɪv/`],
  [8, "daily", `leisure|thời gian rảnh|I read books in my leisure time.|Tôi đọc sách trong thời gian rảnh.|/ˈleʒə/
balanced|cân bằng|A balanced diet is important.|Một chế độ ăn cân bằng rất quan trọng.|/ˈbælənst/
habit|thói quen|Reading before bed is a good habit.|Đọc trước khi ngủ là thói quen tốt.|/ˈhæbɪt/
pressure|áp lực|Some students feel pressure before exams.|Một số học sinh cảm thấy áp lực trước kỳ thi.|/ˈpreʃə/
independent|tự lập|Cooking helps me become independent.|Nấu ăn giúp tôi trở nên tự lập.|/ˌɪndɪˈpendənt/
responsible|có trách nhiệm|We are responsible for keeping our room clean.|Chúng tôi có trách nhiệm giữ phòng sạch sẽ.|/rɪˈspɒnsəbl/`],
  [8, "nature", `habitat|môi trường sống|The forest is a natural habitat for birds.|Rừng là môi trường sống tự nhiên của chim.|/ˈhæbɪtæt/
drought|hạn hán|The long drought has damaged the crops.|Đợt hạn hán dài đã làm hư hại mùa màng.|/draʊt/
flood|lũ lụt|Heavy rain caused a flood in our town.|Mưa lớn gây lũ lụt ở thị trấn chúng tôi.|/flʌd/
conserve|bảo tồn|We must conserve our natural resources.|Chúng ta phải bảo tồn tài nguyên thiên nhiên.|/kənˈsɜːv/
renewable|có thể tái tạo|Wind is a renewable source of energy.|Gió là một nguồn năng lượng tái tạo.|/rɪˈnjuːəbl/
climate|khí hậu|The climate here is hot and dry.|Khí hậu ở đây nóng và khô.|/ˈklaɪmət/`],
  [8, "community", `tradition|truyền thống|Giving lucky money is a Tet tradition.|Lì xì là một truyền thống ngày Tết.|/trəˈdɪʃn/
custom|phong tục|Taking off shoes is a local custom.|Cởi giày là một phong tục địa phương.|/ˈkʌstəm/
heritage|di sản|We should protect our cultural heritage.|Chúng ta nên bảo vệ di sản văn hóa.|/ˈherɪtɪdʒ/
technology|công nghệ|New technology helps us communicate.|Công nghệ mới giúp chúng ta giao tiếp.|/tekˈnɒlədʒi/
invention|phát minh|The telephone was an important invention.|Điện thoại là một phát minh quan trọng.|/ɪnˈvenʃn/
communicate|giao tiếp|We communicate with friends online.|Chúng tôi giao tiếp với bạn bè qua mạng.|/kəˈmjuːnɪkeɪt/`],
  [9, "school", `qualification|bằng cấp|This job requires a teaching qualification.|Công việc này yêu cầu bằng cấp giảng dạy.|/ˌkwɒlɪfɪˈkeɪʃn/
scholarship|học bổng|She won a scholarship to study abroad.|Bạn ấy giành được học bổng du học.|/ˈskɒləʃɪp/
achievement|thành tích|Passing the exam is a great achievement.|Thi đỗ là một thành tích lớn.|/əˈtʃiːvmənt/
career|sự nghiệp|He wants a career in medicine.|Bạn ấy muốn theo đuổi sự nghiệp y khoa.|/kəˈrɪə/
research|nghiên cứu|We do research on how students learn.|Chúng tôi nghiên cứu cách học sinh học tập.|/rɪˈsɜːtʃ/
evaluate|đánh giá|Teachers evaluate our progress each month.|Giáo viên đánh giá tiến bộ của chúng tôi mỗi tháng.|/ɪˈvæljueɪt/`],
  [9, "daily", `nutritious|bổ dưỡng|Vegetable soup is a nutritious meal.|Súp rau là một bữa ăn bổ dưỡng.|/njuˈtrɪʃəs/
confidence|sự tự tin|Practice helps build confidence.|Luyện tập giúp xây dựng sự tự tin.|/ˈkɒnfɪdəns/
priority|sự ưu tiên|Getting enough sleep is my priority.|Ngủ đủ giấc là ưu tiên của tôi.|/praɪˈɒrəti/
budget|ngân sách|We plan our meals on a small budget.|Chúng tôi lên kế hoạch bữa ăn với ngân sách nhỏ.|/ˈbʌdʒɪt/
convenient|thuận tiện|The bus is convenient for my journey.|Xe buýt thuận tiện cho hành trình của tôi.|/kənˈviːniənt/
necessary|cần thiết|Clean water is necessary for good health.|Nước sạch cần thiết cho sức khỏe tốt.|/ˈnesəsəri/`],
  [9, "nature", `biodiversity|đa dạng sinh học|We must protect the biodiversity of our forests.|Chúng ta phải bảo vệ đa dạng sinh học của rừng.|/ˌbaɪəʊdaɪˈvɜːsəti/
sustainable|bền vững|Cycling is a sustainable way to travel.|Đi xe đạp là cách di chuyển bền vững.|/səˈsteɪnəbl/
emission|sự phát thải|The emission of harmful gases must be reduced.|Sự phát thải khí độc hại phải được giảm bớt.|/ɪˈmɪʃn/
ecosystem|hệ sinh thái|A lake is a complex ecosystem.|Hồ là một hệ sinh thái phức tạp.|/ˈiːkəʊsɪstəm/
endangered|có nguy cơ tuyệt chủng|The tiger is an endangered animal.|Hổ là động vật có nguy cơ tuyệt chủng.|/ɪnˈdeɪndʒəd/
resource|tài nguyên|Water is a precious natural resource.|Nước là tài nguyên thiên nhiên quý giá.|/rɪˈsɔːs/`],
  [9, "community", `destination|điểm đến|Da Nang is a popular holiday destination.|Đà Nẵng là điểm đến nghỉ dưỡng được yêu thích.|/ˌdestɪˈneɪʃn/
infrastructure|cơ sở hạ tầng|The city is improving its infrastructure.|Thành phố đang cải thiện cơ sở hạ tầng.|/ˈɪnfrəstrʌktʃə/
preserve|gìn giữ|We preserve old buildings in our town.|Chúng tôi gìn giữ các tòa nhà cổ trong thị trấn.|/prɪˈzɜːv/
diversity|sự đa dạng|Our festival celebrates cultural diversity.|Lễ hội của chúng tôi tôn vinh sự đa dạng văn hóa.|/daɪˈvɜːsəti/
opportunity|cơ hội|This project is an opportunity to learn.|Dự án này là cơ hội để học hỏi.|/ˌɒpəˈtjuːnəti/
cooperate|hợp tác|We cooperate to finish the project.|Chúng tôi hợp tác để hoàn thành dự án.|/kəʊˈɒpəreɪt/`],
];

export const WORDS: Word[] = blocks.flatMap(([grade, topic, text]) => text.split("\n").map((line, index) => {
  const [word, meaning, example, translation, ipa] = line.split("|");
  return { id: `${grade}-${topic}-${index + 1}`, grade, topic, word, meaning, example, translation, ipa };
}));
export const WORD_MAP = new Map(WORDS.map(word => [word.id, word]));
