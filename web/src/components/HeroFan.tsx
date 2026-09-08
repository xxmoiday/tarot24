import { TarotCardFace } from "./TarotCardFace";

/** Quạt bài ở hero: ba lá trên mobile, năm lá trên desktop, lá ngửa nằm giữa. */
export function HeroFan({
  centerTitle = "Ngôi Sao",
  centerId,
}: {
  centerTitle?: string;
  centerId?: string;
}) {
  return (
    <div className="relative mx-auto h-[250px] w-full max-w-[360px] md:h-[340px] md:max-w-[620px]">
      <div
        aria-hidden
        className="absolute top-[46%] left-1/2 size-[320px] -translate-x-1/2 -translate-y-1/2 rounded-full md:size-[520px]"
        style={{
          background:
            "radial-gradient(circle,rgba(201,169,97,0.12) 0%,rgba(201,169,97,0.05) 45%,rgba(201,169,97,0) 70%)",
        }}
      />
      <TarotCardFace
        face="down"
        className="absolute top-[58px] left-[2%] w-[98px] animate-fly md:top-[72px] md:left-[2%] md:w-[130px]"
        style={{ rotate: "-16deg" }}
      />
      <TarotCardFace
        face="down"
        className="absolute top-[58px] right-[2%] w-[98px] animate-fly md:top-[72px] md:right-[2%] md:w-[130px]"
        style={{ rotate: "16deg" }}
      />
      <TarotCardFace
        face="down"
        className="absolute top-[34px] left-[18%] hidden w-[130px] animate-fly md:block"
        style={{ rotate: "-12deg" }}
      />
      <TarotCardFace
        face="down"
        className="absolute top-[34px] right-[18%] hidden w-[130px] animate-fly md:block"
        style={{ rotate: "12deg" }}
      />
      <TarotCardFace
        imageId={centerId}
        title={centerTitle}
        face="up"
        className="absolute top-[30px] left-1/2 w-[116px] -translate-x-1/2 animate-rise md:top-[12px] md:w-[140px]"
      />
    </div>
  );
}
