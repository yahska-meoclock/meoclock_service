import shortid from "shortid"

class Commenter {
    userId: string = ""
    picture: string = ""
    firstName: string = ""
    lastName: string = ""
}

export default class Comment {
    comment: string = ""
    commenter: Commenter = new Commenter()
    clock: string = ""
    appId: string = `cmt-${shortid.generate()}`
    createdAt: Date = new Date()
}