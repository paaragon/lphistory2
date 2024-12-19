import moment from 'moment';
import ConfigI from '../interfaces/ConfigI';
import DaemonRecordI from '../interfaces/daemon/daemon-record';
import dbConnector from '../utils/dbConnector';

export default {
    async getDaemonInfo(conversationId: string, config: ConfigI, daemonVerbose: 'off' | 'summary' | 'full'): Promise<DaemonRecordI[]> {
        if (daemonVerbose === 'off') {
            return [];
        }

        const client = await dbConnector.connect(
            config.pg.host,
            config.pg.port,
            config.pg.database,
            config.pg.user,
            config.pg.password,
            config.pg.schema
        );

        let query = 'select * from tdaemonwsp_tasklog_v2 where conversation_id = $1';
        if (daemonVerbose === 'summary') {
            query += ` and sent_to != 'unsent'`;
        }
        const results = await client.query(query, [conversationId]);

        const daemonInfo = results.rows.map((r) => ({
            ...r,
            task_date: moment(r.task_date, 'YYYY-MM-DDTHH:mm:ss.SSSZ').toDate().getTime(),
            sent_date: moment(r.sent_date, 'YYYY-MM-DDTHH:mm:ss.SSSZ').toDate().getTime(),
        }));

        dbConnector.close(client);

        return daemonInfo;
    }
}