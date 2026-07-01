import qz from 'qz-tray'

qz.security.setCertificatePromise((resolve) => {
    fetch(`${import.meta.env.VITE_BACKEND_URL}/api/qz-certificate`)
        .then(r => r.text())
        .then(resolve)
})

qz.security.setSignatureAlgorithm('SHA512')
qz.security.setSignaturePromise((toSign) => {
    return (resolve, reject) => {
        fetch(`${import.meta.env.VITE_BACKEND_URL}/api/qz-sign`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ data: toSign })
        })
            .then(r => r.text())
            .then(resolve)
            .catch(reject)
    }
})

async function connectQZ() {
    if (!qz.websocket.isActive()) {
        try {
            await qz.websocket.connect()
            console.log('QZ Tray connesso ✅')
        } catch (err) {
            alert('⚠️ QZ Tray non è aperto!\nAvvialo dalla taskbar e riprova.')
            throw err
        }
    }
}

async function stampaComanda(order) {
    try {
        await connectQZ()

        const printer = await qz.printers.find('bar')
        const config = qz.configs.create(printer)

        const data = [
            '\x1B\x40',          // Init
            '\x1B\x61\x01',      // Centro

            '\x1B\x45\x01',
            '\x1B\x21\x20',      // Font doppia altezza
            'CUCINA\n',
            '\x1B\x21\x10',
            `Tavolo: ${order.table} - ${order.number_order}\n`,
            '\x1B\x45\x00',

            '\x1B\x21\x00',

            '================================================\n',

            '\x1B\x61\x00',

            `Coperti : #${order.peoples}\n`,
            `Ora    : ${new Date().toLocaleTimeString('it-IT', {
                hour: '2-digit',
                minute: '2-digit'
            })}\n`,

            '================================================\n\n',

            ...groupByScope(order.products),

            '\n',
            '================================================\n',

            '\n\n\n',
            '\x1D\x56\x42\x00'
        ]

        await qz.print(config, data)
        console.log('Comanda inviata ✅')

    } catch (err) {
        console.error('Errore stampa:', err)
    }
}

async function stampaBar(order) {
    try {
        await connectQZ()

        const printer = await qz.printers.find('bar')
        const config = qz.configs.create(printer)

        const data = [
            '\x1B\x40',          // Init
            '\x1B\x61\x01',      // Centro

            '\x1B\x45\x01',
            '\x1B\x21\x20',      // Font doppia altezza
            'BAR\n',
            '\x1B\x21\x10',
            `Tavolo: ${order.table} - ${order.number_order}\n`,
            '\x1B\x45\x00',

            '\x1B\x21\x00',

            '================================================\n',

            '\x1B\x61\x00',

            `Coperti : #${order.peoples}\n`,
            `Ora    : ${new Date().toLocaleTimeString('it-IT', {
                hour: '2-digit',
                minute: '2-digit'
            })}\n`,

            '================================================\n\n',

            ...groupBar(order.products),

            '\n',
            '================================================\n',

            '\n\n\n',
            '\x1D\x56\x42\x00'
        ]

        await qz.print(config, data)
        console.log('Comanda inviata ✅')

    } catch (err) {
        console.error('Errore stampa:', err)
    }
}

function groupBar(products) {
    const lines = [];
    products.forEach(p => {
        lines.push('\x1B\x21\x10');

        lines.push(`${p.pivot.qty}x ${p.name.toUpperCase()}\n`);

        lines.push('\x1B\x21\x00');

        if (p.pivot.note) {

            lines.push('\x1B\x45\x01');
            lines.push(`   >>> ${p.pivot.note.toUpperCase()}\n`);
            lines.push('\x1B\x45\x00');

        }

        lines.push('\n');
    })

    return lines;
}

function groupByScope(products) {

    const lines = [];

    const grouped = products.reduce((acc, p) => {

        const scope = p.pivot.scope ?? 1;

        if (!acc[scope]) {
            acc[scope] = [];
        }

        acc[scope].push(p);

        return acc;

    }, {});

    Object.keys(grouped).sort().forEach(scope => {

        lines.push('\x1B\x61\x01');
        lines.push('\x1B\x45\x01');
        lines.push('\x1B\x21\x10');
        lines.push(`PORTATA ${scope}\n`);
        lines.push('\x1B\x45\x00');
        lines.push('\x1B\x61\x00');

        lines.push('------------------------------------------------\n');

        grouped[scope].forEach(p => {

            if (p.category_id === 5) return;

            lines.push('\x1B\x21\x10');      // doppia altezza

            lines.push(`${p.pivot.qty}x ${p.name.toUpperCase()}\n`);

            lines.push('\x1B\x21\x00');

            if (p.pivot.note) {

                lines.push('\x1B\x45\x01');
                lines.push(`   >>> ${p.pivot.note.toUpperCase()}\n`);
                lines.push('\x1B\x45\x00');

            }

            lines.push('\n');

        });

    });

    return lines;
}

async function stampaPreconto(order) {

    try {

        await connectQZ();

        const printer = await qz.printers.find('bar');
        const config = qz.configs.create(printer);

        const lineWidth = 48;

        const formatLine = (left, right) => {
            const spaces = Math.max(1, lineWidth - left.length - right.length);
            return left + ' '.repeat(spaces) + right + '\n';
        };

        const coperto = order.peoples * 2;
        const totale = parseFloat(order.total_price);
        const quotaPersona = totale / order.peoples;

        const data = [

            '\x1B\x40',          // Init

            '\x1B\x61\x01',      // Centro
            '\x1B\x45\x01',      // Bold
            '\x1B\x21\x20',      // Doppia altezza

            'AIA DI LAZZARO\n',

            '\x1B\x45\x00',
            '\x1B\x21\x00',

            '================================================\n',

            '\x1B\x61\x00',

            `Tavolo : ${order.table.number}\n`,
            `Cliente: ${order.name}\n`,
            `Ordine : #${order.number_order}\n`,
            `Coperti: ${order.peoples}\n`,
            `Ora    : ${new Date().toLocaleTimeString('it-IT', {
                hour: '2-digit',
                minute: '2-digit'
            })}\n`,

            '================================================\n\n',

            ...order.products.flatMap(p => {

                const qty = p.pivot.qty;
                const total = (parseFloat(p.price) * qty).toFixed(2);

                const rows = [];

                rows.push(
                    formatLine(
                        `${qty} x ${p.name}`,
                        `${total} EUR`
                    )
                );

                if (p.pivot.note) {
                    rows.push(
                        `   >>> ${p.pivot.note.toUpperCase()}\n`
                    );
                }

                rows.push('\n');

                return rows;

            }),

            '------------------------------------------------\n',

            formatLine(
                `${order.peoples} x Coperto`,
                `${coperto.toFixed(2)} EUR`
            ),

            '================================================\n',

            '\x1B\x45\x01',
            '\x1B\x21\x10',

            formatLine(
                'TOTALE',
                `${totale.toFixed(2)} EUR`
            ),

            '\x1B\x21\x00',
            '\x1B\x45\x00',

            '------------------------------------------------\n',

            formatLine(
                'A PERSONA',
                `${quotaPersona.toFixed(2)} EUR`
            ),

            '================================================\n\n',

            '\x1B\x61\x01',

            'Grazie e arrivederci!\n',
            'Si prega di ritirare lo scontrino alla cassa.\n',
            'La presente ricevuta non ha valore fiscale.\n',
            '\n\n\n',

            '\x1D\x56\x42\x00'

        ];
        await qz.print(config, data);
        console.log('Preconto inviato ✅');
    } catch (err) {
        console.error('Errore stampa preconto:', err);
    }
}

export { stampaComanda, stampaPreconto }