export default function clubsPage () {

    return (
        <>
            <div className="min-h-screen flex flex-col items-center">
                <h1 className="text-3xl font-bold text-center mt-10">
                    Find din nærmeste klub
                </h1>
                <div className="flex w-full max-w-6xl justify-between mt-16 px-8">
                    <div className="text-left">
                        <h2 className="text-xl font-semibold">Jylland</h2>
                    </div>

                    <div className="text-center">
                        <h2 className="text-xl font-semibold">Fyn</h2>
                    </div>

                    <div className="text-right">
                        <h2 className="text-xl font-semibold">Sjælland</h2>
                    </div>
                </div>
            </div>
        </>
    )
}