import Image from "next/image";

export default function ConversationUI({ messages, orderDetails }) {

    return (
        <div className="h-full flex flex-col w-full bg-neutral-100 p-4 text-black overflow-y-auto">
            {/* Display the conversation messages */}
            <div className="mt-6 rounded-lg">
                <ul className="space-y-1 flex flex-col">
                    {messages.map((msg, idx) => (
                        <li key={idx} className="flex">
                            {msg.type === "setLastPrompt" && (
                                <div className="flex space-x-2 items-start">
                                    <Image
                                        src="/icon.webp"
                                        width={40}
                                        height={40}
                                        className="rounded-full border shadow object-cover"
                                        alt="icon"
                                    />
                                    <div className="bg-white rounded-xl shadow p-4 py-2.5 pb-3 font-bold break-keep">{msg.promptText}</div>
                                </div>
                            )}

                            {msg.type === "transcript" && (
                                <div className="flex space-x-2 items-start justify-end pb-4 pt-2 pl-16 w-full">
                                    <div className="bg-black text-white rounded-xl text-xs shadow p-4 py-2.5 pb-3 font-bold break-keep">{msg.transcript}</div>
                                    <Image
                                        src="/user.png"
                                        width={30}
                                        height={30}
                                        className="rounded-full object-cover"
                                        alt="icon"
                                    />
                                </div>
                            )}
                            {/* Add handling for other types if needed */}
                        </li>
                    ))}
                </ul>
            </div>

            {/* When order is complete, display the order details in a table */}
            {orderDetails && (
                <div className="flex space-x-2 items-start my-6">
                    <Image
                        src="/icon.webp"
                        width={40}
                        height={40}
                        className="rounded-full border shadow flex-shrink-0 object-cover"
                        alt="icon"
                    />
                    <div className="w-full max-w-lg bg-white p-4 rounded-lg shadow border-2">
                        <h3 className="font-bold mb-4">Your Order</h3>
                        <table className="w-full table-auto">
                            <thead>
                                <tr className="bg-gray-200">
                                    <th className="px-4 py-2">메뉴</th>
                                    <th className="px-4 py-2">맵기</th>
                                    <th className="px-4 py-2">수량</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orderDetails.items.map((item, idx) => (
                                    <tr key={idx} className="border-t">
                                        <td className="px-4 py-2">{item.name}{item?.brand && `(${item.brand})`}</td>
                                        <td className={`px-4 py-2 ${item.spiciness === "맵게" ? "font-bold text-red-600" : item.spiciness === "덜맵게" ? "text-red-400" : ""}`}>{item.spiciness}</td>
                                        <td className="px-4 py-2">{item.quantity}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
