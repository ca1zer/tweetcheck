# Deployment Steps for Fly.io

## Initial Setup and Deployment

0. cd into backend

```bash
cd backend
```

1. Login to Fly

```bash
fly auth login
```

2. Initialize App (Stop with Ctrl+C if it starts copying DB)

```bash
fly launch
```

### (Stop above with Ctrl+C if it starts copying DB)

3. Create Volume (20GB in San Jose)

```bash
fly volumes create tweetcheck_data --size 20 --region sjc
```

4. Deploy Application

```bash
fly deploy
```

5. Scale your machine cuz its slow af

```bash
fly scale vm shared-cpu-4x
fly scale memory 4096
```

## Testing

Test endpoint with timing:

```bash
time curl "https://tweetcheck-backend.fly.dev/api/search?q=pumpfun" | json_pp
```

## Volume Management

List all volumes:

```bash
fly volumes list
```

Delete a volume:

```bash
fly volumes destroy <volume_id>
```
