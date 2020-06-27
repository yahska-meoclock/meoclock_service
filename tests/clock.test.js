import axios from "axios"

test("Testing public clock api", ()=>{
    const publicClocksEndpoint = "https://service.meoclocks.com/public/clocks"
    try{
        console.log(publicClocksEndpoint)
        return axios.get(publicClocksEndpoint).then(data=>{
            console.log(data)
            expect(data).not.toBeNull()
        })
    }catch{
        console.log("500")
    }
})