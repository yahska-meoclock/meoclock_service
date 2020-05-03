import axios from "axios"

test("Testing clock api", ()=>{
    try{
        console.log("157.245.178.52/clock")
        return axios.get("157.245.178.52/clock").then(data=>{
            console.log(data)
            expect(data).not.toBeNull()
        })
    }catch{
        console.log("500")
    }
})