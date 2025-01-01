import { NextApiRequest, NextApiResponse } from 'next';
import { ClientService } from '../services/clientService';
import { handleError } from '../utils/errors';
import { withClientValidation } from '../middleware/validateClientData';
import { withAuth } from '../middleware/auth';
import { AddressFormatter } from '../utils/addressFormatting';
import { AuthenticatedRequest } from '../middleware/auth';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'POST': {
        // Address will be validated and formatted by the validation middleware
        const client = await ClientService.createClient(req.body);
        return res.status(201).json(client);
      }

      case 'GET': {
        if (req.query.id) {
          const client = await ClientService.getClient(req.query.id as string);
          return res.status(200).json(client);
        } else if (req.query.email) {
          const client = await ClientService.getClientByEmail(req.query.email as string);
          return res.status(200).json(client);
        } else if (req.query.phone) {
          const client = await ClientService.getClientByPhone(req.query.phone as string);
          return res.status(200).json(client);
        } else if (req.query.search) {
          const clients = await ClientService.searchClients(req.query.search as string);
          return res.status(200).json(clients);
        } else if (req.query.address) {
          // Parse and format address for search
          const parsedAddress = AddressFormatter.parseAddress(req.query.address as string);
          if (!parsedAddress) {
            return res.status(400).json({ 
              error: 'ValidationError',
              message: 'Invalid address format',
              details: { address: ['Invalid Australian address format'] }
            });
          }
          const formattedAddress = AddressFormatter.formatAddress(parsedAddress);
          const clients = await ClientService.searchClients(formattedAddress);
          return res.status(200).json(clients);
        }
        return res.status(400).json({ error: 'Missing search parameters' });
      }

      case 'PUT': {
        if (!req.query.id) {
          return res.status(400).json({ error: 'Missing client ID' });
        }
        // Address will be validated and formatted by the validation middleware
        const updatedClient = await ClientService.updateClient(
          req.query.id as string,
          req.body
        );
        return res.status(200).json(updatedClient);
      }

      case 'DELETE': {
        if (!req.query.id) {
          return res.status(400).json({ error: 'Missing client ID' });
        }
        await ClientService.deleteClient(req.query.id as string);
        return res.status(204).end();
      }

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    const { status, body } = handleError(error);
    return res.status(status).json(body);
  }
}

// Apply middleware in order: auth -> validation -> handler
export default withAuth(withClientValidation(handler));
