import {Button} from "@/components/Button";
import {Card} from "@/components/Card";
import layoutStyles from "@/styles/Layout.module.css"
import formStyles from "@/styles/Forms.module.css"
import cardStyles from "@/components/Card/Card.module.css"

export default function Components () {
    return (
        <>
            <Button variant='outline'>outline button</Button>
            <Button variant='green'>green button</Button>
            <Button variant='red'>red button</Button>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card variant='info' >
                    <h2 className={cardStyles.title}>cardStyles.title</h2>
                    <p className={cardStyles.text}>cardStyles.text</p>
                </Card>
                <Card variant='info' >
                    <h2 className={cardStyles.title}>cardStyles.title</h2>
                    <p className={cardStyles.text}>cardStyles.text</p>
                </Card>
                <Card variant='info' >
                    <h2 className={cardStyles.title}>cardStyles.title</h2>
                    <p className={cardStyles.text}>cardStyles.text</p>
                </Card>
                <Card variant='info' >
                    <h2 className={cardStyles.title}>cardStyles.title</h2>
                    <p className={cardStyles.text}>cardStyles.text</p>
                </Card>
                <Card variant='info' >
                    <h2 className={cardStyles.title}>cardStyles.title</h2>
                    <p className={cardStyles.text}>cardStyles.text</p>
                </Card>
                <Card variant='info' >
                    <h2 className={cardStyles.title}>cardStyles.title</h2>
                    <p className={cardStyles.text}>cardStyles.text</p>
                </Card>
            </div>
        </>
    )
}