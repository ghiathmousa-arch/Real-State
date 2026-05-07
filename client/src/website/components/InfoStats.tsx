interface dataState{
    title: string
    subTitle:string
}
const contentDataState : dataState[]=[
    {
        title:'15k',
        subTitle:'عميل راضٍ'
    },
    {
        title:'+120',
        subTitle:'مشروع حصري'
    },
    {
        title:'+500',
        subTitle:'عقار مباع'
    }
]
const InfoStats = () => {
    return (
        <div className="flex divide-x-2 divide-white 
        min-[300px]:max-[550px]:flex-col gap-2.5">
            {contentDataState.map((item , index) => (
                <div  key={index}>
                    <div className="text-white px-12">
                    <h1 className="font-bold text-4xl mb-2">{item.title}</h1>
                    <p className="text-sm">{item.subTitle}</p>
                </div>
                </div>
            ))}
        </div>
    )
}

export default InfoStats
